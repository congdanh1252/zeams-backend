const { getFirestore } = require('firebase-admin/firestore')
var admin = require("firebase-admin")
var serviceAccount = require('../zeams-69c66-firebase-adminsdk-stwyv-35ef42539f.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})
const db = getFirestore()

const generateId = () => {
  var result = ""
  var characters = "abcdefghijklmnopqrstuvwxyz0123456789"
  var charactersLength = characters.length
  for (var i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

const addRoom = (id, callback) => {
  db.collection("rooms").add({
    roomId: id
  })
  .then((docRef) => {
    callback(docRef.id)
  })
  .catch((error) => {
    console.error("Error adding document: ", error)
  })
}

const addParticipantToRoom = (docId, participantId, callback) => {
  db.collection('rooms')
  .doc(docId)
  .get()
  .then(snapshot => {
    if (snapshot.exists) {
      const data = snapshot.data()
      let currentPeople = data.participants ? data.participants : []
      currentPeople.push(participantId)

      db.collection('rooms').doc(docId)
      .update({
        participants: currentPeople
      })
      .then(() => {
        callback(data.participants || [])
        return
      })
    }
  })
}

exports.generateId = generateId
exports.addRoom = addRoom
exports.addParticipantToRoom = addParticipantToRoom