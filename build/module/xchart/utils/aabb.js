export const aabbVSPoint2D = (bounds, point) => {
    const { min, max } = bounds;
    if (point.x < min.x || point.x > max.x)
        return false;
    if (point.y < min.y || point.y > max.y)
        return false;
    return true;
};
