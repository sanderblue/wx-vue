class ApiHelper {
  createLatitudeLongitudeUriParam(data) {
    // If no proper coordinates, return the coordinates for
    // Scott Base, Ross Island, Antarctica.
    if (!data.latitude || !data.longitude) {
      console.warn('No proper coordinates were provided. Using fallback coordinates of -77.84999847,166.80000305.');

      return '-77.84999847,166.80000305';
    }

    return `${data.latitude},${data.longitude}`;
  }

  createZipCodeUriParam(data) {
    return `${data.zip_code}`;
  }

  isSafeResponseForUriCreation(res) {
    if (res.data.latitude && res.data.longitude) {
      return true;
    }

    if (res.data.zip_code) {
      return true;
    }

    return false;
  }
}

export default new ApiHelper();
