export default class GeolocationModel {
    constructor(options) {

    }

    getCurrentPosition(options) {

        navigator.geolocation.getCurrentPosition(
            this.onGetCurrentPositionSuccess.bind(this),
            this.onGetCurrentPositionFail.bind(this),
            options
        );
    }

    onGetCurrentPositionSuccess(pos) {
        console.debug('POSITION', pos);
    }

    onGetCurrentPositionFail(err) {

    }
}
