'use client';

import axios, { endpoints } from 'src/utils/axios';

import { setSession } from './utils';
import { STORAGE_KEY } from './constant';

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ email, password }) => {
  try {
    const params = { email, password };

    const res = await axios.post(endpoints.auth.signIn, params);

    const { accessToken } = res.data;
    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    setSession(accessToken);
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({ email, password, name, confirmPassword }) => {
  const params = {
    email,
    password,
    name,
    confirmPassword,
  };

  try {
    const res = await axios.post(endpoints.auth.signUp, params);

    const { accessToken, user } = res.data;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    setSession(accessToken);

    return { user, accessToken };
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async () => {
  try {
    // Clear session and token
    await setSession(null);

    // Clear any cached data
    sessionStorage.removeItem(STORAGE_KEY);

    // Redirect to sign in page
    window.location.href = '/auth/jwt/sign-in';
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
