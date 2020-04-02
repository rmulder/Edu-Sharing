import {style, animate, transition} from "@angular/animations";
export class UIAnimation{
  public static ANIMATION_TIME_FAST=100;
  public static ANIMATION_TIME_NORMAL=200;
  public static fade(time=UIAnimation.ANIMATION_TIME_NORMAL){
    return  [transition(':enter', [
      style({opacity:0}),
      animate(time, style({opacity:1}))
    ]),
      transition(':leave', [
        animate(time, style({opacity:0})) ])

    ];

  }
  public static fromLeft(time=UIAnimation.ANIMATION_TIME_NORMAL){
    return  [transition(':enter', [
      style({transform:'translateX(-100%)'}),
      animate(time, style({transform:'translateX(0)'}))
    ]),
      transition(':leave', [
        style({transform:'translateX(0)'}),
        animate(time, style({transform:'translateX(-100%)'}))      ])
    ];
  }
  public static fromRight(time=UIAnimation.ANIMATION_TIME_NORMAL){
    return  [transition(':enter', [
      style({transform:'translateX(100%)'}),
      animate(time, style({transform:'translateX(0)'}))
    ]),
      transition(':leave', [
        style({transform:'translateX(0)'}),
        animate(time, style({transform:'translateX(100%)'}))      ])
    ];
  }

  /**
   * Useful animation for opening any overflow menus
   * @param time
   * @returns {AnimationStateTransitionMetadata[]}
   */
  public static openOverlay(time=UIAnimation.ANIMATION_TIME_NORMAL){
    return  [transition(':enter', [
      style({'transform-origin':'50% 0%',transform:'scaleY(0.5)',opacity:0}),
      animate(time, style({transform:'scaleY(1)',opacity:1}))
    ]),
      transition(':leave', [
        style({'transform-origin':'50% 0%',transform:'scaleY(1)',opacity:1}),
        animate(time, style({transform:'scaleY(0.5)',opacity:0}))      ])
    ];
  }
  /**
   * Useful animation for opening any overflow menus - inverted (from bottom to top)
   * @param time
   * @returns {AnimationStateTransitionMetadata[]}
   */
  public static openOverlayBottom(time=UIAnimation.ANIMATION_TIME_NORMAL){
    return  [transition(':enter', [
      style({'transform-origin':'50% 100%',transform:'scaleY(0.5)',opacity:0}),
      animate(time, style({transform:'scaleY(1)',opacity:1}))
    ]),
      transition(':leave', [
        style({'transform-origin':'50% 100%',transform:'scaleY(1)',opacity:1}),
        animate(time, style({transform:'scaleY(0.5)',opacity:0}))      ])
    ];
  }
}