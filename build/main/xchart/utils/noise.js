"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noise = void 0;
const etc_1 = require("./etc");
const hash_1 = require("./hash");
const noise = (x) => {
    const id = Math.floor(x);
    let lv = (0, etc_1.fract)(x);
    lv = lv * lv * (3.0 - 2.0 * lv);
    const a = (0, hash_1.hashf)(id + 0);
    const b = (0, hash_1.hashf)(id + 1);
    return (0, etc_1.lerp)(a, b, lv);
};
exports.noise = noise;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9pc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMveGNoYXJ0L3V0aWxzL25vaXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtCQUFvQztBQUNwQyxpQ0FBK0I7QUFFeEIsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFTLEVBQUUsRUFBRTtJQUNqQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3pCLElBQUksRUFBRSxHQUFHLElBQUEsV0FBSyxFQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUNoQyxNQUFNLENBQUMsR0FBRyxJQUFBLFlBQUssRUFBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDeEIsTUFBTSxDQUFDLEdBQUcsSUFBQSxZQUFLLEVBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3hCLE9BQU8sSUFBQSxVQUFJLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN4QixDQUFDLENBQUE7QUFQWSxRQUFBLEtBQUssU0FPakIifQ==