'use server';
import { redirect } from 'next/navigation';
import { signOut } from './auth';

export const logOut = async () => {
  await signOut();
  redirect('/');
};
