// import I18n from 'react-native-i18n'

// const missingTranslationRegex = /^\[missing ".*" translation\]$/

// // This function is a wrapper to avoid exception wich leads in a crash
// const translateOrFallback = initialMsg => {
//   // We tried to translate something else than a string
//   // The native I18n function will simply crash instead of rejecting the attempt with an error message
//   if (typeof initialMsg !== 'string') {
//     __DEV__

//     return '' // We don't return any message as we don't know what to send
//   }

//   let localMsg = I18n.t(initialMsg)

//   // The translation does not exist, the default message is not very sexy
//   // Instead we return the message we tried to translate
//   if (missingTranslationRegex.test(localMsg)) {
//     __DEV__

//     return initialMsg
//   }

//   return localMsg
// }

// export default {
//   ...I18n,
//   t: translateOrFallback
// }
