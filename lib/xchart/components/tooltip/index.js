import { X } from "xel";
import { VEC2 } from "../../utils/vector";
import { pxToRemStr, remToPx } from "../../utils/style";
//const shadow = `0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)`;
var shadowFilter = "drop-shadow(0px 2px 4px rgba(0,0,0, 0.5));";
//const shadowFilter = `drop-shadow(0px 2px 4px rgba(0,0,0, 0.5));`
export var Tooltip = X('div', {
    initialState: {
        position: VEC2(0, 0),
        opacity: 1,
        uid: 'xchart-tooltip'
    },
    render: function (props, state, callee) {
        var minHeight = 8;
        var minWidth = 160;
        var x = state.position.x - 10;
        var y = state.position.y - remToPx(minHeight);
        var ys = "".concat(y, "px");
        var xs = "".concat(x, "px");
        var tipWidth = 8;
        var tipHeight = 8;
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
                opacity: "".concat(state.opacity * 100.0, "%")
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
                            borderWidth: "".concat(tipHeight, "px ").concat(tipWidth, "px 0"),
                            borderColor: 'white transparent',
                            borderRadius: '2px',
                            position: 'absolute',
                            bottom: "-".concat(tipHeight - 0.3, "px"),
                            left: "".concat(tipWidth * 0.5, "px")
                        }
                    },
                    render: function () {
                        return state.body ? state.body : '';
                    }
                })
            ]
        });
    }
});
export var Tooltip__backup = X("div", {
    initialState: {
        position: VEC2(0, 0),
        body: X('div', {})
    },
    render: function (props, state, callee) {
        var minHeight = 8;
        var minWidth = 64;
        var x = state.position.x - 10;
        var y = state.position.y - remToPx(minHeight);
        var ys = "".concat(y, "px");
        var xs = "".concat(x, "px");
        var tipWidth = 8;
        var tipHeight = 8;
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
                            borderWidth: "".concat(tipHeight, "px ").concat(tipWidth, "px 0"),
                            borderColor: "white transparent",
                            borderRadius: '2px',
                            pointerEvents: 'none',
                            position: "absolute",
                            bottom: "-".concat(tipHeight - 0.3, "px"),
                            left: "".concat(tipWidth * 0.5, "px"),
                        },
                    },
                    render: function () {
                        return function () { return 'hello'; };
                    },
                    //children: state.body ? [state.body] : [],
                }),
            ],
        });
    },
});
//# sourceMappingURL=index.js.map