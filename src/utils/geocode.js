const GOOGLE_API_KEY = 'AIzaSyBq2vZw0vfoiTSm2DypMQ6-odWpsJYLCEc';

// const GOOGLE_API_KEY = 'my-google-api-key';

// export const getAddressFromCoords = async (lat, lng) => {
//   try {
//     const response = await fetch(
//       `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
//       {
//         headers: {
//           'User-Agent': 'PresenzaApp/1.0',
//         },
//       },
//     );

//     const data = await response.json();

//     if (!data || !data.display_name) {
//       return 'Address unavailable';
//     }

//     return data.display_name;
//   } catch (error) {
//     console.error('Geocode error:', error);
//     return 'Address unavailable';
//   }
// };

export const getAddressFromCoords = async (lat, lng) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results.length) {
      return 'Address unavailable';
    }

    return data.results[0].formatted_address;
  } catch (error) {
    console.error('Geocode error:', error);
    return 'Address unavailable';
  }
};
