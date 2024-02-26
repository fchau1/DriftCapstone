import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppScreenStack from './components/AppScreenStack';
import { DrawerContent } from './pages/DrawerContent';
import SettingsPage from './pages/SettingsPage';
import AuthStackScreen from './pages/AuthScreenStack';
import { SafeAreaProvider } from "react-native-safe-area-context";
const Drawer = createDrawerNavigator();

import axios from 'axios';
import { AuthContext } from './components/context';

const App = () => {

    // initial login state variables
    const initialLoginState = {
    	isLoading: true,
    	username: null,
    	userToken: null
    };

	const [data, setData] = React.useState([]);
	const API_URL = 'http://192.168.1.88:3000';

    const loginReducer = (previousState, event) => {
    	switch(event.type) {
        	case 'GET_TOKEN':
        		return {
            		...previousState,
            		userToken: event.token,
           			isLoading: false
        		};
        	case 'LOGIN':
        		return {
        			...previousState,
            		username: event.id,
            		userToken: event.token,
            		isLoading: false
        		};
        	case 'LOGOUT':
        		return {
					...previousState,
					username: null,
					userToken: null,
					isLoading: false
        		};      
        	case 'SIGNUP':
        		return {
					...previousState,
					username: event.id,
					userToken: event.token,
					isLoading: false
        		};    
    	}
    };

    const [loginState, dispatch] = React.useReducer(loginReducer, initialLoginState);

    const authContext = React.useMemo(() => ({
    	SignUp: async (fName, lName, username, email, phoneNumber, pass) => { 
			let userToken;
			userToken = null;

			try {
				const response = await axios.post(API_URL + '/user/signUp', {
					"firstName": fName, 
					"lastName": lName, 
					"username": username, 
					"emailAddress": email, 
					"phoneNum": phoneNumber, 
					"password": pass 
				});
				console.log(response);
			} catch(error) {
				console.error(error);
			}

		},
    	Login: async (username, password) => {
        	let userToken;
        	userToken = null;
			
			// // try {
			// // 	const response = await axios.get(API_URL + '/user');
			// // 	console.log(API_URL + '/user');
			// // 	console.log("Get ALL users axios API call - \n\n", response.data);
			// // 	// const json = await response.json();
			// // 	// console.log(json);
			// // 	// setData(json);
			// // } catch(error) {
			// // 	console.error('Error fetching data: ', error);
			// // }
			// console.log(API_URL + '/user/login');

			// try {
			// 	console.log("Before w/ \'" + username + "\' and \'" + password + "\'");
			// 	const res = await axios.post(API_URL + '/user/login', { username: username, password: password });
			// 	console.log("GET input user by parameters - \n\n", res.data);

			// 	if(res.data != '') {
			// 		userToken = 'randomToken';
			// 		AsyncStorage.setItem('userToken', userToken);
			// 	} else {
			// 		alert("Please check your login information.  Username and/or password are incorrect!");
			// 	}
			// } catch(error) {
			// 	console.log(error);
			// }

        	if(username == 'username' && password == 'password') {
        		try {
            		// set random token currently, but pull from db once API developed
            		userToken = 'randomToken';
            		await AsyncStorage.setItem('userToken', userToken);
        		} catch(e) {
            		console.log(e);
            	}
      		} else {
				alert("Please check your login information.  Username and/or password are incorrect!");
			}
        	dispatch({ type: 'LOGIN', id: username, token: userToken });
    	},
        SignOut: async () => {
      		try {
        		// set random token currently, but pull from db once API developed
        		userToken = 'random';
        		await AsyncStorage.removeItem('userToken');
        	} catch(e) {
        		console.log(e);
        	}

      		dispatch({ type: 'LOGOUT' });
    	},
    }), []);

    useEffect(() => {
    	setTimeout(async () => {
        	let userToken;
        	userToken = null;
        	try {
        		userToken = await AsyncStorage.getItem('userToken', userToken);
    		} catch(e) {
    			console.log("ERROR: ", e);
        	}
      		dispatch({ type: 'GET_TOKEN', token: userToken });
    	}, 1000);""
    }, []);

    if (loginState.isLoading) {
    	return (
        	<View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
          		<ActivityIndicator size={'large'} />
        	</View>
    	);
    }

    return (
    	<AuthContext.Provider value={authContext}>
			<SafeAreaProvider>
				<NavigationContainer>
					{ loginState.userToken != null ? (
					// Drawer container - if user logged in

						<Drawer.Navigator drawerContent={props => <DrawerContent {... props} />}>
							<Drawer.Screen name="Drift" component={AppScreenStack} />
							<Drawer.Screen name="Settings" component={SettingsPage} />
						</Drawer.Navigator>
					
					) : (
						// signup/login screen stack
						<AuthStackScreen />
					)}
				</NavigationContainer>
			</SafeAreaProvider>
    	</AuthContext.Provider>
  	);
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3962FF',
	alignItems: 'center',
    justifyContent: 'center',
  },

});