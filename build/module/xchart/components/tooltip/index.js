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
        const y = state.position.y - remToPx(minHeight * 0.75);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMveGNoYXJ0L2NvbXBvbmVudHMvdG9vbHRpcC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsQ0FBQyxFQUF5QixNQUFNLEtBQUssQ0FBQztBQUUvQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDMUMsT0FBTyxFQUFXLFVBQVUsRUFBRSxPQUFPLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUVqRSwwRUFBMEU7QUFDMUUsTUFBTSxZQUFZLEdBQUcsNENBQTRDLENBQUM7QUFFbEUsbUVBQW1FO0FBRW5FLE1BQU0sQ0FBQyxNQUFNLE9BQU8sR0FBRyxDQUFDLENBQXFDLEtBQUssRUFBRTtJQUNsRSxZQUFZLEVBQUU7UUFDWixRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEIsT0FBTyxFQUFFLENBQUM7UUFDVixHQUFHLEVBQUUsZ0JBQWdCO0tBQ3RCO0lBQ0QsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTTtRQUN6QixNQUFNLFNBQVMsR0FBRyxDQUFDLENBQUE7UUFDbkIsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFBO1FBRXBCLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUMvQixNQUFNLENBQUMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFBO1FBQ3RELE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUE7UUFDbkIsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQTtRQUNuQixNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUE7UUFDbEIsTUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFBO1FBRW5CLE9BQU8s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