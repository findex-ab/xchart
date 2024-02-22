"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tooltip__backup = exports.Tooltip = void 0;
const xel_1 = require("xel");
const vector_1 = require("../../utils/vector");
const style_1 = require("../../utils/style");
//const shadow = `0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)`;
const shadowFilter = `drop-shadow(0px 2px 4px rgba(0,0,0, 0.5));`;
//const shadowFilter = `drop-shadow(0px 2px 4px rgba(0,0,0, 0.5));`
exports.Tooltip = (0, xel_1.X)('div', {
    initialState: {
        position: (0, vector_1.VEC2)(0, 0),
        opacity: 1,
        uid: 'xchart-tooltip'
    },
    render(props, state, callee) {
        const minHeight = 8;
        const minWidth = 160;
        const x = state.position.x - 10;
        const y = state.position.y - (0, style_1.remToPx)(minHeight * 0.75);
        const ys = `${y}px`;
        const xs = `${x}px`;
        const tipWidth = 8;
        const tipHeight = 8;
        return (0, xel_1.X)('div', {
            cname: state.uid || props.uid,
            style: {
                filter: shadowFilter,
                position: 'fixed',
                zIndex: 99,
                top: ys,
                left: xs,
                width: 'fit-content',
                height: 'fit-content',
                minWidth: (0, style_1.pxToRemStr)(minWidth),
                minHeight: (0, style_1.pxToRemStr)(minHeight),
                background: 'white',
                userSelect: 'none',
                opacity: `${state.opacity * 100.0}%`
            },
            children: [
                (0, xel_1.X)('div', {
                    cname: (state.uid || props.uid || '') + '-sheet',
                    stylesheet: {
                        padding: '0.25rem',
                        position: 'relative',
                        width: 'fit-content',
                        height: 'fit-content',
                        borderRadius: '0.2rem',
                        minWidth: (0, style_1.pxToRemStr)(minWidth),
                        minHeight: (0, style_1.pxToRemStr)(minHeight),
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
exports.Tooltip__backup = (0, xel_1.X)("div", {
    initialState: {
        position: (0, vector_1.VEC2)(0, 0),
        body: (0, xel_1.X)('div', {})
    },
    render(props, state, callee) {
        const minHeight = 8;
        const minWidth = 64;
        const x = state.position.x - 10;
        const y = state.position.y - (0, style_1.remToPx)(minHeight);
        const ys = `${y}px`;
        const xs = `${x}px`;
        const tipWidth = 8;
        const tipHeight = 8;
        return (0, xel_1.X)("div", {
            style: {
                filter: shadowFilter,
                position: "fixed",
                zIndex: 99,
                top: ys,
                left: xs,
                width: "fit-content",
                height: "fit-content",
                minWidth: (0, style_1.pxToRemStr)(minWidth),
                minHeight: (0, style_1.pxToRemStr)(minHeight),
                background: 'white',
                pointerEvents: 'none'
            },
            children: [
                (0, xel_1.X)("div", {
                    stylesheet: {
                        padding: '0.35rem',
                        position: 'relative',
                        width: "fit-content",
                        height: "fit-content",
                        borderRadius: '0.2rem',
                        minWidth: (0, style_1.pxToRemStr)(minWidth),
                        minHeight: (0, style_1.pxToRemStr)(minHeight),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMveGNoYXJ0L2NvbXBvbmVudHMvdG9vbHRpcC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2QkFBK0M7QUFFL0MsK0NBQTBDO0FBQzFDLDZDQUFpRTtBQUVqRSwwRUFBMEU7QUFDMUUsTUFBTSxZQUFZLEdBQUcsNENBQTRDLENBQUM7QUFFbEUsbUVBQW1FO0FBRXRELFFBQUEsT0FBTyxHQUFHLElBQUEsT0FBQyxFQUFxQyxLQUFLLEVBQUU7SUFDbEUsWUFBWSxFQUFFO1FBQ1osUUFBUSxFQUFFLElBQUEsYUFBSSxFQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEIsT0FBTyxFQUFFLENBQUM7UUFDVixHQUFHLEVBQUUsZ0JBQWdCO0tBQ3RCO0lBQ0QsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTTtRQUN6QixNQUFNLFNBQVMsR0FBRyxDQUFDLENBQUE7UUFDbkIsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFBO1FBRXBCLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUMvQixNQUFNLENBQUMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFBLGVBQU8sRUFBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUE7UUFDdEQsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQTtRQUNuQixNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFBO1FBQ25CLE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQTtRQUNsQixNQUFNLFNBQVMsR0FBRyxDQUFDLENBQUE7UUFFbkIsT0FBTyxJQUFBLE9BQUMsRUFBQyxLQUFLLEVBQUU7WUFDZCxLQUFLLEVBQUUsS0FBSyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRztZQUM3QixLQUFLLEVBQUU7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