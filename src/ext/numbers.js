var round = function(n, places) {
    return +(Math.round(n + "e+" + places)  + "e-" + places);
};