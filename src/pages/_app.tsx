import React from 'react';
import '../styles/globals.css'

function SafeHydrate({ children }) {
  return (
    <div suppressHydrationWarning>
      {typeof window === 'undefined' ? null : children}
    </div>
  )
}

function MyApp({ Component, pageProps }) {
  const CustomLayout = Component.layout ? Component.layout : React.Fragment;
  return (
    <SafeHydrate>
      <CustomLayout>
        <Component { ...pageProps } />
      </CustomLayout>
    </SafeHydrate>
  )
}

export default MyApp
