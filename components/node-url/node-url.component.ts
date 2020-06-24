import {Component, Input} from '@angular/core';
import {Node} from '../../../core-module/rest/data-object';
import {Params} from "@angular/router";
import {NodeHelper} from "../../node-helper";
import {UIConstants} from "../../../core-module/ui/ui-constants";
import {RestNetworkService} from "../../../core-module/rest/services/rest-network.service";

@Component({
  selector: 'app-node-url',
  template: `<a 
                [routerLink]="get('routerLink')" 
                [queryParams]="get('queryParams')" 
                [class.unclickable]="unclickable">
              <ng-content></ng-content>
              </a>`,
})
export class NodeUrlComponent {
  private _node: Node;
  @Input() set node (node: Node) {
    this._node = node;
  }
  @Input() unclickable: boolean;
  constructor() {
  }
  get(mode: 'routerLink' | 'queryParams'): any {
    if (!this._node) {
      return null;
    }
    let data: { routerLink: string, queryParams: Params } = null;
    if (NodeHelper.isNodeCollection(this._node)) {
      data = {
        routerLink: UIConstants.ROUTER_PREFIX + 'collections',
        queryParams: { id: this._node.ref.id },
      };
    } else {
      if (this._node.isDirectory) {
        data = {
          routerLink: UIConstants.ROUTER_PREFIX + 'workspace',
          queryParams: { id: this._node.ref.id },
        };
      } else if(this._node.ref) {
        const fromeHome = RestNetworkService.isFromHomeRepo(this._node);
        data = {
          routerLink: UIConstants.ROUTER_PREFIX + 'render/' + this._node.ref.id,
          queryParams: {
            repository: fromeHome ? null : this._node.ref.repo,
          },
        };
      }
    }
    if(data === null){
      return '';
    }
    if(mode === 'routerLink') {
      return '/' + data.routerLink;
    }
    return data.queryParams;
  }
}
