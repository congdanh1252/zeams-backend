var cloudinary = require('cloudinary')

cloudinary.v2.config({ 
  cloud_name: 'dpc0elrwr', 
  api_key: '143492981654684', 
  api_secret: '7GTrQNapAPep4_XIQgv4Nuk5puM',
  secure: true
})

const storeAsset = (asset, callback) => {
  try {
    if (asset) {
      cloudinary.v2.uploader
      .upload(asset, {
        resource_type: "auto",
        upload_preset: "dc68mwoc"
      })
      .then((result) => {
        console.log('Upload asset success!')
        console.log(result.secure_url)
        callback(result.secure_url)
      })
      .catch((error) => {
        console.log("Error", JSON.stringify(error))
      })
    }
  } catch (error) {
    console.log(error)
  }
}

exports.storeAsset = storeAsset