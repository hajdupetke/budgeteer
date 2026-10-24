import 'server-only';
import React, { type ReactNode } from 'react';
import { ReadError } from '@/lib/read-query';

export const renderReadSection = async (render: () => Promise<ReactNode>) => {
  try { return await render(); } catch (error) {
    if (error instanceof ReadError) return <p role="alert">{error.message}</p>;
    throw error;
  }
};
