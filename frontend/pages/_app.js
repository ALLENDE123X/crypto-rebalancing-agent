import '../styles/globals.css';
import '@near-wallet-selector/modal-ui/styles.css';
import { Layout } from '../components/layout/Layout';
import { NearProvider } from '../lib/near/NearContext';
import React from 'react';
import Error from './_error';

class MyApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error("Application error:", error, errorInfo);
    this.setState({ errorInfo });
  }
  
  render() {
    const { Component, pageProps } = this.props;
    
    if (this.state.hasError) {
      return <Error statusCode={500} />;
    }
    
    return (
      <NearProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </NearProvider>
    );
  }
}

export default MyApp; 