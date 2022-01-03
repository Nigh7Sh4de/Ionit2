# Ionit2

## Onboarding

1. Install Node (I use 10.16.3)
2. Set up environment variables
   - ANDROID_HOME = `%LOCALAPPDATA%\Android\Sdk`
   - PATH += `%LOCALAPPDATA%\Android\Sdk\platform-tools`
   - PATH += `%LOCALAPPDATA%\Android\Sdk\emulator`
3. Run yarn
4. Update _google-services.json_
   - `$ keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android` (You may need to `$ cd` to the jdk dir first, check _C:/Program Files/Java_)
   - Copy SHA-1
   - Go to Firebase console and add SHA-1
   - Download and replace _android/app/google-services.json_

## Running Android

1. Run emulator (using Adroid Studio or `$ emulator` if you already have one configured)
2. `$ npx react-native start` to start the web builder
3. `$ npx react-native android` to build and install the Android app
