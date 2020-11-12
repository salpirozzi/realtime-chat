var carousel;

window.onload = () => {
    carousel = new Flickity('#page-app', { 
        prevNextButtons: false,
        pageDots: false,
        cellAlign: "center",
        draggable: false
    });
};

var next = () => {
    carousel.next(false, false);
}
var previous = () => {
    carousel.previous(false, false);
}