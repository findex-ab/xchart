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
        const y = state.position.y - (0, style_1.remToPx)(minHeight);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMveGNoYXJ0L2NvbXBvbmVudHMvdG9vbHRpcC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2QkFBK0M7QUFFL0MsK0NBQTBDO0FBQzFDLDZDQUFpRTtBQUVqRSwwRUFBMEU7QUFDMUUsTUFBTSxZQUFZLEdBQUcsNENBQTRDLENBQUM7QUFFbEUsbUVBQW1FO0FBRXRELFFBQUEsT0FBTyxHQUFHLElBQUEsT0FBQyxFQUFxQyxLQUFLLEVBQUU7SUFDbEUsWUFBWSxFQUFFO1FBQ1osUUFBUSxFQUFFLElBQUEsYUFBSSxFQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEIsT0FBTyxFQUFFLENBQUM7UUFDVixHQUFHLEVBQUUsZ0JBQWdCO0tBQ3RCO0lBQ0QsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTTtRQUN6QixNQUFNLFNBQVMsR0FBRyxDQUFDLENBQUE7UUFDbkIsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFBO1FBRXBCLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUMvQixNQUFNLENBQUMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFBLGVBQU8sRUFBQyxTQUFTLENBQUMsQ0FBQTtRQUMvQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFBO1FBQ25CLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUE7UUFDbkIsTUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFBO1FBQ2xCLE1BQU0sU0FBUyxHQUFHLENBQUMsQ0FBQTtRQUVuQixPQUFPLElBQUEsT0FBQyxFQUFDLEtBQUssRUFBRTtZQUNkLEtBQUssRUFBRSxLQUFLLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHO1lBQzdCLEtBQUssRUFBRTtnQkFDTCxNQUFN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