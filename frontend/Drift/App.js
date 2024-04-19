import 'react-native-gesture-handler';
import React, { useContext, useEffect } from 'react';
import { Alert, StyleSheet, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppScreenStack from './components/AppScreenStack';
import { DrawerContent } from './pages/DrawerContent';
import SettingsPage from './pages/SettingsPage';
import OrdersPage from './pages/OrdersPage';
import AuthStackScreen from './pages/AuthScreenStack';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StripeProvider } from '@stripe/stripe-react-native';
import { CartProvider } from './components/CartContext'
import AdminScreenStack from './pages/pages_admin/AdminScreenStack';
const Drawer = createDrawerNavigator();

import axios from 'axios';
import { AuthContext } from './components/context';
import configs from './config';
import useUserStore from './components/UserContext';

const STRIPE_KEY = 
	'pk_test_51Oe7muAh9NlzJ6kblOAtWXQxbJVim5q4EddknofdzrUzG9kWcvGP8JshwEwoafCskVAwtdzHaXwK0FKypiMgS0zl00AICSn8NI';

const App = () => {

    // initial login state variables
    const initialLoginState = {
    	isLoading: true,
    	username: null,
    	userToken: null
    };

	const API_URL = configs[0].API_URL;

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
					pwd: event.pwd,
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

	// const ZusfirstName = useUserStore((state) => state.firstName);
	// const ZusLastName = useUserStore((state) => state.lastName); 

	const setUserID = useUserStore((state) => state.updateUserID);
	const setFirstName = useUserStore((state) => state.updateFirstName); 
	const setLastName = useUserStore((state) => state.updateLastName);
	const setUsername = useUserStore((state) => state.updateUsername);
	const setEmail = useUserStore((state) => state.updateEmail);
    const clearUserInfo = useUserStore((state) => state.clearUserInfo);

    const authContext = React.useMemo(() => ({
    	SignUp: async (fName, lName, username, email, phoneNumber, pass, confirmPass) => { 
			let userToken, res;
			userToken = null;

			try {
				console.log("In SIGNUP w/ ", fName, lName, username, email, phoneNumber, pass, confirmPass)
				
				if(!email.includes("@")) {
					Alert.alert("Invalid Email","Please use a valid email address!"); 
				} else if(pass.length < 8) {
					alert("Password Length Too Short", "Password needs to be at least 8 characters in length!");
				} else if(pass != confirmPass) {
					alert("Password Mismatch", "Make sure password's are identical!");
				} else {
					res = await axios.post(API_URL + '/user/signUp', {
						"firstName": fName, 
						"lastName": lName, 
						"username": username, 
						"emailAddress": email, 
						"phoneNum": phoneNumber, 
						"password": pass 
					});

					if(res.data == "ERROR: please enter correct sign up details.") {
						alert("Error in signup details.  Please check and try again!");
					} else {
						userToken = 'randomToken';
						AsyncStorage.setItem('userToken', userToken);

						setUserID(res.data[0][0].userID);
						setFirstName(fName);
						setLastName(lName);
						setUsername(username);
						setEmail(email);
						// profile["userID"] = res.data[0].userID;
						// profile["fName"] = res.data[0].firstName;
						// profile["lName"] = res.data[0].lastName;
						// profile["email"] = res.data[0].emailAddress;
					}
					console.log(res.data[0]);
				}
			} catch(error) {
				console.error(error);
			}
        	dispatch({ type: 'SIGNUP', id: username, token: userToken });
		},
    	Login: async (username, password) => {
        	let userToken;
        	userToken = null;
			
			console.log(API_URL + '/user/login');

			try {
				// console.log("Before w/ \'" + username + "\' and \'" + password + "\'");
				const res = await axios.post(API_URL + '/user/login', { username: username, password: password });
				console.log(res.data);

				if (username == "admin" && password == "AdminP@ss2024!") {
					userToken = 'adminToken';
					AsyncStorage.setItem('userToken', userToken);
				} else if (res.data == "Wrong password found in API!" || res.data == "Error logging in!") {
					alert("Please check your login information.  Username and/or password are incorrect!");
				} else {
					userToken = 'randomUserToken';
					AsyncStorage.setItem('userToken', userToken);
					// value={ZusfirstName};
					setUserID(res.data[0].userID);
					setFirstName(res.data[0].firstName);
					setLastName(res.data[0].lastName);
					setUsername(res.data[0].username);
					setEmail(res.data[0].emailAddress);

					// profile["userID"] = res.data[0].userID;
					// profile["fName"] = res.data[0].firstName;
					// profile["lName"] = res.data[0].lastName;
					// profile["email"] = res.data[0].emailAddress;
					// console.log("Profile set as => ", profile);
					// console.log(`Zustand profile -> ${ZusfirstName}`);
				}
			} catch(error) {
				console.log(error);
			}
        	dispatch({ type: 'LOGIN', id: username, token: userToken, pwd: password });
    	},
        SignOut: async () => {
      		try {
        		// set random token currently, but pull from db once API developed
        		userToken = 'random';
        		await AsyncStorage.removeItem('userToken');

				clearUserInfo();
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
				<StripeProvider publishableKey = {STRIPE_KEY}>
					<CartProvider>
					{/* <UserContext> */}
						<NavigationContainer>
							{(() => {
								// console.log(loginState.userToken);
								if (loginState.userToken == "adminToken") {
									console.log("Admin signed in.");
									return <AdminScreenStack />
								} else if (loginState.userToken != null) {
									// Drawer container - if user logged in
									return (
										<Drawer.Navigator drawerContent={props => <DrawerContent {... props} />}>
											<Drawer.Screen name="Drift" component={AppScreenStack} />
											<Drawer.Screen name="Settings" component={SettingsPage} />
											<Drawer.Screen name="Orders" component={OrdersPage} />
										</Drawer.Navigator>
									)
								} else {
									// signup/login screen stack
									return <AuthStackScreen />
								}
							})()}
						</NavigationContainer>
						{/* </UserContext> */}
					</CartProvider>
				</StripeProvider>
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