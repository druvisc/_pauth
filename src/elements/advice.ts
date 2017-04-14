// if(something) context.addAdvice('resetCache');


// rule {
//       permit
//       condition booleanOneAndOnly(careRelationExists)

//       on permit {
//         obligation notifyPatient {
//           message = "Your record was accessed"
//           notificationRecipient = patientId
//          }
//         advice notifyDoctor {
//            message = "The patient has been notified of this access."
//            notificationRecipient = doctorId

//         }
//        }
//      }

//     obligation notifyPatient = "urn:notifyPatient"
//      advice notifyDoctor = "urn:notifyDoctor"

//     attribute message {
//        id = "urn:notification:message"
//        type = string
//        category = subjectCat
//     }

//     attribute notificationRecipient {
//        id = "urn:notification:recipient"
//        type = string
//        category = subjectCat
//     }