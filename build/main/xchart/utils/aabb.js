"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aabbVSPoint2D = void 0;
const aabbVSPoint2D = (bounds, point) => {
    const { min, max } = bounds;
    if (point.x < min.x || point.x > max.x)
        return false;
    if (point.y < min.y || point.y > max.y)
        return false;
    return true;
};
exports.aabbVSPoint2D = aabbVSPoint2D;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWFiYi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy94Y2hhcnQvdXRpbHMvYWFiYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFRTyxNQUFNLGFBQWEsR0FBRyxDQUFDLE1BQVksRUFBRSxLQUFhLEVBQUUsRUFBRTtJQUMzRCxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQztJQUM1QixJQUFJLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQUUsT0FBUSxLQUFLLENBQUM7SUFDdEQsSUFBSSxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztRQUFFLE9BQVEsS0FBSyxDQUFDO0lBQ3RELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQyxDQUFBO0FBTFksUUFBQSxhQUFhLGlCQUt6QiJ9