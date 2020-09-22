import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import {
    Node,
    RestConnectorService,
    RestConstants,
    RestMdsService,
    View,
} from '../../../core-module/core.module';
import { MdsEditorCommonService } from './mds-editor-common.service';
import { NativeWidget } from './mds-editor-view/mds-editor-view.component';
import {
    BulkMode,
    EditorType,
    InputStatus,
    MdsDefinition,
    MdsGroup,
    MdsWidget,
    MdsWidgetType,
    MdsWidgetValue,
    NativeWidgetType,
    RequiredMode,
    Values,
} from './types';
import { MdsEditorWidgetVersionComponent } from './widgets/mds-editor-widget-version/mds-editor-widget-version.component';

export interface CompletionStatusEntry {
    completed: number;
    total: number;
}

export type Widget = InstanceType<typeof MdsEditorInstanceService.Widget>;
type CompletionStatus = { [key in RequiredMode]: CompletionStatusEntry };

/**
 * Manages state for an MDS editor instance.
 *
 * Do _not_ use in legacy `<mds>` component.
 */
@Injectable()
export class MdsEditorInstanceService {
    static Widget = class {
        readonly hasUnsavedDefault: boolean;
        readonly hasCommonInitialValue: boolean;
        readonly initialValue: readonly string[];
        private value: string[];
        private hasChanged = false;
        private status: InputStatus;
        private bulkMode?: BehaviorSubject<BulkMode>; // only when `isBulk`
        private showMissingRequiredFunction: (shouldScrollIntoView: boolean) => boolean;
        constructor(
            private mdsEditorInstanceService: MdsEditorInstanceService,
            public readonly definition: MdsWidget,
            nodes: Node[],
        ) {
            if (nodes.length > 0) {
                const nodeValues = nodes.map((node) => this.readNodeValue(node, definition));
                if (arraysAreEqual(nodeValues)) {
                    if (nodeValues[0] === undefined) {
                        this.initialValue = this.getDefaultValue(definition);
                        this.hasUnsavedDefault = this.initialValue.length > 0;
                    } else {
                        this.initialValue = nodeValues[0] ?? [];
                    }
                    this.hasCommonInitialValue = true;
                } else {
                    this.initialValue = [];
                    this.hasCommonInitialValue = false;
                }
            } else {
                throw new Error('not implemented');
            }
            this.value = [...this.initialValue];
            if (this.mdsEditorInstanceService.getIsBulk(nodes)) {
                this.bulkMode = new BehaviorSubject<BulkMode>('no-change');
            }
        }

        getValue(): string[] {
            return this.value;
        }

        getHasChanged(): boolean {
            return this.hasChanged;
        }

        getStatus(): InputStatus {
            return this.status;
        }

        getBulkMode(): BulkMode {
            return this.bulkMode.value;
        }

        async getSuggestedValues(searchString?: string): Promise<MdsWidgetValue[]> {
            if (this.definition.values) {
                return this.getLocalSuggestedValues(searchString);
            } else {
                return this.getRemoteSuggestedValues(searchString);
            }
        }

        setValue(value: string[]): void {
            this.value = value;
            this.updateHasChanged();
            this.mdsEditorInstanceService.updateCanSave();
            this.mdsEditorInstanceService.updateCompletionState();
        }

        setStatus(value: InputStatus): void {
            this.status = value;
            this.mdsEditorInstanceService.updateCanSave();
        }

        setBulkMode(value: BulkMode): void {
            this.bulkMode.next(value);
            this.updateHasChanged();
            this.mdsEditorInstanceService.updateCanSave();
        }

        observeBulkMode(): Observable<BulkMode> {
            return this.bulkMode.asObservable();
        }

        /**
         * Register function to reveal a missing required field.
         *
         * @param f reveals the required hint if the field is required and has no value; returns
         * whether the field was missing and scrolled into view
         */
        onShowMissingRequired(f: (shouldScrollIntoView: boolean) => boolean) {
            if (this.showMissingRequiredFunction) {
                throw new Error('onShowMissingRequired was called more than once');
            }
            this.showMissingRequiredFunction = f;
        }

        /**
         * @returns whether the the widget was scrolled into view
         */
        showMissingRequired(shouldScrollIntoView: boolean): boolean {
            if (this.showMissingRequiredFunction) {
                return this.showMissingRequiredFunction(shouldScrollIntoView);
            } else {
                return false;
            }
        }

        private updateHasChanged() {
            switch (this.bulkMode?.value) {
                case 'no-change':
                    this.hasChanged = false;
                    break;
                case 'append':
                    this.hasChanged = this.value.length > 0;
                    break;
                case 'replace':
                case undefined:
                    this.hasChanged =
                        !this.hasCommonInitialValue || !arrayIsEqual(this.value, this.initialValue);
            }
        }

        private getLocalSuggestedValues(searchString?: string): MdsWidgetValue[] {
            if (searchString) {
                const filterString = searchString.toLowerCase();
                return this.definition.values.filter(
                    (value) =>
                        value.caption.toLowerCase().indexOf(filterString) === 0 ||
                        value.id.toLowerCase().indexOf(filterString) === 0,
                );
            } else {
                return this.definition.values;
            }
        }

        private async getRemoteSuggestedValues(searchString?: string): Promise<MdsWidgetValue[]> {
            if (searchString?.length < 2) {
                return new Promise((resolve) => resolve([]));
            }
            return this.mdsEditorInstanceService.restMdsService
                .getValues(
                    {
                        valueParameters: {
                            query: RestConstants.DEFAULT_QUERY_NAME,
                            property: this.definition.id,
                            pattern: searchString,
                        },
                        criterias: [],
                        /*
                        criterias: RestSearchService.convertCritierias(
                            Helper.arrayJoin(this._currentValues, this.getValues()),
                            this.mds.widgets,
                        ),*/
                    },
                    this.mdsEditorInstanceService.mdsId,
                    // TODO: Real repo id for search needs to be added
                    RestConstants.HOME_REPOSITORY,
                )
                .map(({ values }) => {
                    return values.map((v) => {
                        return {
                            id: v.key,
                            caption: v.displayString ?? v.key,
                        };
                    });
                })
                .toPromise();
        }

        private readNodeValue(node: Node, definition: MdsWidget): string[] {
            if (definition.type === MdsWidgetType.Range) {
                const from: string[] = node.properties[`${definition.id}_from`];
                const to: string[] = node.properties[`${definition.id}_to`];
                if (from !== undefined && to !== undefined) {
                    return [from?.[0], to?.[0]];
                } else {
                    return undefined;
                }
            } else {
                return node.properties[definition.id];
            }
        }

        private getDefaultValue(definition: MdsWidget): string[] {
            if (definition.type === MdsWidgetType.Slider) {
                return [definition.defaultMin?.toString()];
            } else if (definition.type === MdsWidgetType.Range) {
                return [definition.defaultMin?.toString(), definition.defaultMax?.toString()];
            } else if (definition.defaultvalue) {
                return [definition.defaultvalue];
            } else {
                return [];
            }
        }
    };

    // Fixed after initialization
    mdsId: string;
    /** Complete MDS definition. */
    mdsDefinition: MdsDefinition;
    /** Nodes with updated and complete metadata. */
    nodes = new BehaviorSubject<Node[]>(null);
    /** MDS Views of the relevant group (in order). */
    views: View[];
    /** Whether the editor is in bulk mode to edit multiple nodes at once. */
    isBulk: boolean;

    /**
     * Active widgets.
     *
     * Widgets are not added or removed after initialization, but hold mutable state.
     */
    private widgets: Widget[];
    /**
     * Active, "native" widgets (which are not defined via mds properties directly).
     *
     * E.g. `preview`, `version`, `author`.
     *
     * Will be appended on init depending if they exist in the currently rendered group.
     */
    private nativeWidgets: NativeWidget[] = [];

    // Mutable state.
    private completionStatus = new ReplaySubject<CompletionStatus>(1);
    private canSave = new BehaviorSubject(false);
    private lastScrolledIntoViewIndex: number = null;

    constructor(
        private mdsEditorCommonService: MdsEditorCommonService,
        private restMdsService: RestMdsService,
        private restConnector: RestConnectorService,
    ) {}

    /**
     * Initializes the service, fetching data from the backend.
     *
     * @throws UserPresentableError
     */
    async init(nodes: Node[], refetch = true): Promise<EditorType> {
        if(refetch) {
            this.nodes.next(await this.mdsEditorCommonService.fetchNodesMetadata(nodes));
        } else {
            this.nodes.next(nodes);
        }
        this.isBulk = this.getIsBulk(this.nodes.value);
        this.mdsId = this.mdsEditorCommonService.getMdsId(this.nodes.value);
        this.mdsDefinition = await this.mdsEditorCommonService.fetchMdsDefinition(this.mdsId);
        const groupId = this.mdsEditorCommonService.getGroupId(this.nodes.value);
        const group = this.getGroup(this.mdsDefinition, groupId);
        this.views = this.getViews(this.mdsDefinition, group);
        this.widgets = this.initWidgets(this.nodes.value, this.mdsDefinition, this.views);
        this.updateCompletionState();
        return group.rendering;
    }

    initAlt(
        groupId: string,
        setId: string = '-default-',
        repository: string = '-home-',
        currentValues: Values = {},
    ): void {
        // TODO implement
    }

    getWidget(propertyName: string): Widget {
        return this.widgets.find((widget) => widget.definition.id === propertyName);
    }

    getCanSave(): boolean {
        return this.canSave.value;
    }

    observeCanSave(): Observable<boolean> {
        return this.canSave.asObservable();
    }

    getCompletionStatus(): Observable<CompletionStatus> {
        return this.completionStatus.asObservable();
    }

    /**
     * Shows the required hints of all missing widgets and scrolls widgets into view, rotating
     * through all widgets when called multiple times.
     */
    showMissingRequiredWidgets(): void {
        if (this.lastScrolledIntoViewIndex === null) {
            // No widget was scrolled into view yet. We need to touch all widgets so they will
            // display the required hint and tell them to scroll into view until we found a missing
            // one.
            let hasBeenScrolledIntoView = false;
            for (const [index, widget] of this.widgets.entries()) {
                const hasJustBeenScrolledIntoView = widget.showMissingRequired(
                    !hasBeenScrolledIntoView,
                );
                if (hasJustBeenScrolledIntoView) {
                    hasBeenScrolledIntoView = true;
                    this.lastScrolledIntoViewIndex = index;
                }
            }
        } else {
            // We already touched all widgets and scrolled one into view. Just iterate the widgets
            // starting from the one that was last scrolled into view until we find the next missing
            // one.
            for (let i = 0; i < this.widgets.length; i++) {
                const index = (i + this.lastScrolledIntoViewIndex + 1) % this.widgets.length;
                const hasJustBeenScrolledIntoView = this.widgets[index].showMissingRequired(true);
                if (hasJustBeenScrolledIntoView) {
                    this.lastScrolledIntoViewIndex = index;
                    break;
                }
            }
        }
    }

    async save(): Promise<Node[]> {
        let updatedNodes: Node[];
        console.log(this.nativeWidgets);
        const versionWidget: MdsEditorWidgetVersionComponent = this.nativeWidgets.find(
            (w) => w instanceof MdsEditorWidgetVersionComponent,
        ) as MdsEditorWidgetVersionComponent;
        for(const widget of this.nativeWidgets) {
            if(widget.onSaveNode) {
                await widget.onSaveNode(this.nodes.value);
            }
        }
        if (versionWidget) {
            if (versionWidget.file) {
                updatedNodes = await this.mdsEditorCommonService.saveNodesMetadata(
                    this.getNodeValuePairs(),
                );
                await this.mdsEditorCommonService.saveNodeContent(
                    this.nodes.value[0],
                    versionWidget.file,
                    versionWidget.comment,
                );
                return updatedNodes;
            }
        }
        updatedNodes = await this.mdsEditorCommonService.saveNodesMetadata(
            this.getNodeValuePairs(),
            versionWidget?.comment || RestConstants.COMMENT_METADATA_UPDATE,
        );
        return updatedNodes;
    }

    private getIsBulk(nodes: Node[]): boolean {
        return nodes.length > 1;
    }

    private updateCanSave() {
        this.canSave.next(
            (this.widgets.every((state) => state.getStatus() !== 'INVALID') &&
                this.widgets.some(
                    (state) =>
                        (state.getHasChanged() || state.hasUnsavedDefault) &&
                        state.getStatus() !== 'DISABLED',
                )) ||
                this.nativeWidgets.some((w) => w.hasChanges.value),
        );
    }

    private getGroup(mdsDefinition: MdsDefinition, groupId: string): MdsGroup {
        return mdsDefinition.groups.find((g) => g.id === groupId);
    }

    private getViews(mdsDefinition: MdsDefinition, group: MdsGroup): View[] {
        return group.views.map((viewId) => mdsDefinition.views.find((v) => v.id === viewId));
    }

    private initWidgets(nodes: Node[], mdsDefinition: MdsDefinition, views: View[]): Widget[] {
        const result: Widget[] = [];
        const availableWidgets = mdsDefinition.widgets
            .filter(
                (widget) =>
                    !Object.values(NativeWidgetType).includes(widget.id as NativeWidgetType),
            )
            .filter((widget) => views.some((view) => view.html.indexOf(widget.id) !== -1))
            .filter((widget) => this.meetsCondition(nodes, widget));
        for (const availableWidget of availableWidgets) {
            if (
                !result.some((widget) => widget.definition.id === availableWidget.id) ||
                this.isActiveOverridingWidget(availableWidget, views)
            ) {
                result.push(new MdsEditorInstanceService.Widget(this, availableWidget, nodes));
            }
        }
        return result;
    }

    private isActiveOverridingWidget(widget: MdsWidget, views: View[]): boolean {
        return widget.template && views.some((view) => view.html.includes(widget.template));
    }

    private meetsCondition(nodes: Node[], widget: MdsWidget): boolean {
        if (!widget.condition) {
            return true;
        } else if (widget.condition.type === 'PROPERTY') {
            if (nodes.length > 0) {
                return nodes.every(
                    (node) => widget.condition.negate === !node.properties[widget.condition.value],
                );
            } else {
                throw new Error('not implemented');
            }
        } else if (widget.condition.type === 'TOOLPERMISSION') {
            return (
                widget.condition.negate ===
                !this.restConnector.hasToolPermissionInstant(widget.condition.value)
            );
        }
        throw new Error(`Unsupported condition type: ${widget.condition.type}`);
    }

    private getNodeValuePairs(): Array<{ node: Node; values: Values }> {
        return this.nodes.value.map((node) => ({
            node,
            values: this.getValuesForNode(node),
        }));
    }

    private getValuesForNode(node: Node): Values {
        let values = this.widgets.reduce((acc, widget) => {
            const property = widget.definition.id;
            const newValue = this.getNewPropertyValue(widget, node.properties[property]);
            if (newValue) {
                if (widget.definition.type === MdsWidgetType.Range) {
                    acc[`${property}_from`] = [newValue[0]];
                    acc[`${property}_to`] = [newValue[1]];
                } else {
                    acc[property] = newValue;
                }
            }
            return acc;
        }, {} as { [key: string]: string[] });
        this.nativeWidgets.forEach(
            (widget) => (values = widget.getValues ? widget.getValues(node, values) : values),
        );
        return values;
    }

    private getNewPropertyValue(widget: Widget, oldPropertyValue?: string[]): string[] {
        if (!widget.getHasChanged() && !widget.hasUnsavedDefault) {
            return null;
        } else if (!this.isBulk) {
            return widget.getValue();
        } else {
            switch (widget.getBulkMode()) {
                case 'no-change':
                    return null;
                case 'append':
                    return removeDuplicates([...(oldPropertyValue ?? []), ...widget.getValue()]);
                case 'replace':
                    return widget.getValue();
            }
        }
    }

    private updateCompletionState(): void {
        this.completionStatus.next(
            Object.values(RequiredMode).reduce((acc, requiredMode) => {
                acc[requiredMode] = this.getCompletionStatusEntry(requiredMode);
                return acc;
            }, {} as CompletionStatus),
        );
    }

    private getCompletionStatusEntry(requiredMode: RequiredMode): CompletionStatusEntry {
        const total = this.widgets.filter(
            (widget) => widget.definition.isRequired === requiredMode,
        );
        const completed = total.filter((widget) => widget.getValue() && widget.getValue()[0]);
        return {
            total: total.length,
            completed: completed.length,
        };
    }

    registerNativeWidget(nativeWidget: NativeWidget) {
        this.nativeWidgets.push(nativeWidget);
        nativeWidget.hasChanges.subscribe(() => {
            this.updateCanSave();
        });
    }
}

function arraysAreEqual<T>(arrays: T[][]) {
    if (arrays.length === 0) {
        return true;
    } else {
        return arrays.slice(1).every((array) => arrayIsEqual(arrays[0], array));
    }
}

function arrayIsEqual<T>(lhs: readonly T[], rhs: readonly T[]): boolean {
    if (!lhs && !rhs) {
        return true;
    } else if (!lhs || !rhs) {
        return false;
    } else if (lhs.length !== rhs.length) {
        return false;
    } else {
        return lhs.every((value, index) => rhs[index] === value);
    }
}

function removeDuplicates<T>(array: T[]): T[] {
    return array.filter((value, index) => array.indexOf(value) === index);
}
