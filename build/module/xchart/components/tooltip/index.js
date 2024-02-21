import { X } from "xel";
import { VEC2 } from "../../utils/vector";
import { pxToRemStr, remToPx } from "../../utils/style";
//const shadow = `0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)`;
const shadowFilter = `drop-shadow(0px 2px 4px rgba(0,0,0, 0.5));`;
//const shadowFilter = `drop-shadow(0px 2px 4px rgba(0,0,0, 0.5));`
export const Tooltip = X('div', {
    initialState: {
        position: VEC2(0, 0),
        opacity: 1,
        uid: 'xchart-tooltip'
    },
    render(props, state, callee) {
        const minHeight = 8;
        const minWidth = 160;
        const x = state.position.x - 10;
        const y = state.position.y - remToPx(minHeight);
        const ys = `${y}px`;
        const xs = `${x}px`;
        const tipWidth = 8;
        const tipHeight = 8;
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
        });
    }
});
export const Tooltip__backup = X("div", {
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
                            bottom: `-${tipHeight - 0.3}px`,
                            left: `${tipWidth * 0.5}px`,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMveGNoYXJ0L2NvbXBvbmVudHMvdG9vbHRpcC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsQ0FBQyxFQUF5QixNQUFNLEtBQUssQ0FBQztBQUUvQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDMUMsT0FBTyxFQUFXLFVBQVUsRUFBRSxPQUFPLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUVqRSwwRUFBMEU7QUFDMUUsTUFBTSxZQUFZLEdBQUcsNENBQTRDLENBQUM7QUFFbEUsbUVBQW1FO0FBRW5FLE1BQU0sQ0FBQyxNQUFNLE9BQU8sR0FBRyxDQUFDLENBQXFDLEtBQUssRUFBRTtJQUNsRSxZQUFZLEVBQUU7UUFDWixRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEIsT0FBTyxFQUFFLENBQUM7UUFDVixHQUFHLEVBQUUsZ0JBQWdCO0tBQ3RCO0lBQ0QsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTTtRQUN6QixNQUFNLFNBQVMsR0FBRyxDQUFDLENBQUE7UUFDbkIsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFBO1FBRXBCLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUMvQixNQUFNLENBQUMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDL0MsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQTtRQUNuQixNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFBO1FBQ25CLE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQTtRQUNsQixNQUFNLFNBQVMsR0FBRyxDQUFDLENBQUE7UUFFbkIsT0FBTyxDQUFDLENBQUMs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