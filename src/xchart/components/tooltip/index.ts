import { X, XElement, XFunctional } from "xel";
import { VisdTooltipProps } from "./types";
import { VEC2 } from "../../utils/vector";
import { pxToRem, pxToRemStr, remToPx } from "../../utils/style";

//const shadow = `0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)`;
const shadowFilter = `drop-shadow(0px 2px 4px rgba(0,0,0, 0.5));`;

//const shadowFilter = `drop-shadow(0px 2px 4px rgba(0,0,0, 0.5));`

export const Tooltip = X<VisdTooltipProps, VisdTooltipProps>('div', {
  initialState: {
    position: VEC2(0, 0),
    opacity: 1,
    uid: 'xchart-tooltip'
  },
  render(props, state, callee): any {
    const minHeight = 8
    const minWidth = 160

    const x = state.position.x - 10
    const y = state.position.y - remToPx(minHeight * 0.75)
    const ys = `${y}px`
    const xs = `${x}px`
    const tipWidth = 8
    const tipHeight = 8

    return X('div', {
      cname: state.uid || props.uid,
      style: {
        filter: shadowFilter,
        position: 'fixed',
        zIndex: 99,
        top: ys,
        left: xs,
        width: 'fit-content',
        height: 'fit-content',
        minWidth: pxToRemStr(minWidth),
        minHeight: pxToRemStr(minHeight),
        background: 'white',
        userSelect: 'none',
        opacity: `${state.opacity * 100.0}%`
      },
      children: [
        X('div', {
          cname: (state.uid || props.uid || '') + '-sheet',
          stylesheet: {
            padding: '0.25rem',
            position: 'relative',
            width: 'fit-content',
            height: 'fit-content',
            borderRadius: '0.2rem',
            minWidth: pxToRemStr(minWidth),
            minHeight: pxToRemStr(minHeight),
            pointerEvents: 'none',
            background: 'white',
            userSelect: 'none',
            '&:after': {
              content: '',
              display: 'inline-block',
              borderStyle: 'solid',
              borderWidth: `${tipHeight}px ${tipWidth}px 0`,
              borderColor: 'white transparent',
              borderRadius: '2px',
              position: 'absolute',
              bottom: `-${tipHeight - 0.3}px`,
              left: `${tipWidth * 0.5}px`
            }
          },
          render() {
            return state.body ? state.body : '';
          }
        })
      ]
    })
  }
})



export const Tooltip__backup = X<VisdTooltipProps, VisdTooltipProps>("div", {
  initialState: {
    position: VEC2(0, 0),
    body: X('div', {})
  },
  render(props, state, callee) {
    const minHeight = 8;
    const minWidth = 64;
    
    const x = state.position.x - 10;
    const y = state.position.y - remToPx(minHeight);
    const ys = `${y}px`;
    const xs = `${x}px`;
    const tipWidth = 8;
    const tipHeight = 8;

    return X("div", {
      style: {
        filter: shadowFilter,
        position: "fixed",
        zIndex: 99,
        top: ys,
        left: xs,
        width: "fit-content",
        height: "fit-content",
        minWidth: pxToRemStr(minWidth),
        minHeight: pxToRemStr(minHeight),
        background: 'white',
        pointerEvents: 'none'
      },
      children: [
        X("div", {
          stylesheet: {
            padding: '0.35rem',
            position: 'relative',
            width: "fit-content",
            height: "fit-content",
            borderRadius: '0.2rem',
            minWidth: pxToRemStr(minWidth),
            minHeight: pxToRemStr(minHeight),
            pointerEvents: "none",
            background: "white",
            "&:after": {
              content: '',
              display: "inline-block",
              borderStyle: "solid",
              borderWidth: `${tipHeight}px ${tipWidth}px 0`,
              borderColor: "white transparent",
              borderRadius: '2px',
              pointerEvents: 'none',
              position: "absolute",
              bottom: `-${tipHeight-0.3}px`,
              left: `${tipWidth*0.5}px`,
            },
          },
          render() {
            return () => 'hello';
          },
          //children: state.body ? [state.body] : [],
        }),
      ],
    });
  },
});
