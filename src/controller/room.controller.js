const { getFirestore } = require("firebase-admin/firestore")
var admin = require("firebase-admin")
var serviceAccount = require("../zeams-69c66-firebase-adminsdk-stwyv-35ef42539f.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
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
  db.collection("rooms")
    .add({
      roomId: id,
    })
    .then((docRef) => {
      callback(docRef.id)
    })
    .catch((error) => {
      console.error("Error adding document: ", error)
    })
}

const addParticipantToRoom = (docRef, participant, callback) => {
  db.collection("rooms")
    .doc(docRef)
    .get()
    .then((snapshot) => {
      if (snapshot.exists) {
        const data = snapshot.data()
        const participantData = {
          id: participant.id,
          name: participant.name,
        }
        let currentPeople = data.participants ? data.participants : []
        currentPeople.push(participantData)

        db.collection("rooms")
          .doc(docRef)
          .update({
            participants: currentPeople,
          })
          .then(() => {
            callback(data.participants || [])
            return
          })
      }
    })
}

const removeParticipantFromRoom = (docRef, participantId, callback) => {
  db.collection("rooms")
    .doc(docRef)
    .get()
    .then((snapshot) => {
      if (snapshot.exists) {
        const temp = []
        const data = snapshot.data()
        let currentPeople = data.participants ? data.participants : []
        let position = -1

        for (let index = 0; index < currentPeople.length; index++) {
          if (currentPeople[index].id == participantId) {
            position = index
            break
          }
        }

        if (position != -1) {
          currentPeople.splice(position, 1)
        }

        if (currentPeople.length == 0) {
          db.collection("rooms")
            .doc(docRef)
            .delete()
            .then(() => {
              callback()
              return
            })
        } else {
          db.collection("rooms")
            .doc(docRef)
            .update({
              participants: currentPeople,
            })
            .then(() => {
              callback()
              return
            })
        }
      }
    })
}

exports.generateId = generateId
exports.addRoom = addRoom
exports.addParticipantToRoom = addParticipantToRoom
exports.removeParticipantFromRoom = removeParticipantFromRoom
