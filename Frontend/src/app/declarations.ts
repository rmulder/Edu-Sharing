  import {FileChooserComponent} from "./common/ui/file-chooser/file-chooser.component";
  import {RouterComponent} from "./router/router.component";
  import {BreadcrumbsComponent} from "./common/ui/breadcrumbs/breadcrumbs.component";
  import {ActionbarComponent} from "./common/ui/actionbar/actionbar.component";
  import {FileDropDirective} from "./common/ui/file-drop";
  import {ModalDialogComponent} from "./common/ui/modal-dialog/modal-dialog.component";
  import {FormatSizePipe} from "./core-ui-module/file-size.pipe";
  import {NodeRenderComponent} from "./common/ui/node-render/node-render.component";
  import {NodeDatePipe} from "./core-ui-module/date.pipe";
  import {PermissionNamePipe} from "./common/ui/permission-name.pipe";
  import {AuthorityNamePipe} from "./common/ui/authority-name.pipe";
  import {MainNavComponent} from "./common/ui/main-nav/main-nav.component";
  import {MdsComponent} from "./common/ui/mds/mds.component";
  import {ApplyToLmsComponent} from "./common/ui/apply-to-lms/apply-to-lms.component";
  import {ModalLoadingComponent} from "./common/ui/modal-loading/modal-loading.component";
  import {MdsTestComponent} from "./common/test/mds-test/mds-test.component";
  import {ModalDialogToastComponent} from "./common/ui/modal-dialog-toast/modal-dialog-toast.component";
  import {ToolListComponent} from "./common/ui/tool-list/tool-list.component";
  import {UserProfileComponent} from "./common/ui/user-profile/user-profile.component";
  import {ToucheventDirective} from "./common/ui/touchevents/touchevents";
  import {NodeTitlePipe} from "./common/ui/node-title.pipe";
  import {BannerComponent} from "./common/ui/banner/banner.component";
  import {SmallCollectionComponent} from "./common/ui/small-collection/small-collection.component";
  import {UserAvatarComponent} from "./common/ui/user-avatar/user-avatar.component";
  import {InfobarComponent} from "./common/ui/infobar/infobar.component";
  import {AuthorityColorPipe} from "./common/ui/authority-color.pipe";
  import {TimePipe} from "./common/ui/time.pipe";
  import {AutocompleteComponent} from "./common/ui/autocomplete/autocomplete.component";
  import {AuthoritySearchInputComponent} from "./common/ui/authority-search-input/authority-search-input.component";
  import {KeysPipe} from './common/keys.pipe';
  import {NodeInfoComponent} from "./common/ui/node-info/node-info.component";
  import {TutorialComponent} from "./common/ui/tutorial/tutorial.component";
  import {CookieInfoComponent} from './common/ui/cookie-info/cookie-info.component';
  import {InputPasswordComponent} from "./common/ui/input-password/input-password.component";
  import {PoweredByComponent} from "./common/ui/powered-by/powered-by.component";
  import {FooterComponent} from "./common/ui/footer/footer.component";
  import {CalendarComponent} from "./common/ui/calendar/calendar.component";
  import {ImageConfigDirective} from "./common/ui/image-config.directive";
  import {CardComponent} from "./common/ui/card/card.component";
  import {UserQuotaComponent} from "./common/ui/user-quota/user-quota.component";
  import {UrlPipe} from "./common/url.pipe";

  export const DECLARATIONS = [
      MdsTestComponent,
      CalendarComponent,
      FormatSizePipe,
      NodeDatePipe,
      TimePipe,
      PermissionNamePipe,
      AuthorityNamePipe,
      AutocompleteComponent,
      AuthoritySearchInputComponent,
      AuthorityColorPipe,
      NodeTitlePipe,
      FileChooserComponent,
      BreadcrumbsComponent,
      ActionbarComponent,
      InputPasswordComponent,
      NodeInfoComponent,
      SmallCollectionComponent,
      MainNavComponent,
      UserProfileComponent,
      UserAvatarComponent,
      MdsComponent,
      RouterComponent,
      FileDropDirective,
      CardComponent,
      ModalDialogComponent,
      InfobarComponent,
      ModalLoadingComponent,
      NodeRenderComponent,
      ApplyToLmsComponent,
      ModalDialogToastComponent,
      ToolListComponent,
      UserQuotaComponent,
      ToucheventDirective,
      PoweredByComponent,
      BannerComponent,
      FooterComponent,
      KeysPipe,
      UrlPipe,
      CookieInfoComponent,
      TutorialComponent,
      ImageConfigDirective
    ];
