import '../styles/globals.css';
import { Layout } from '../components/layout/Layout';
import { NearProvider } from '../lib/near/NearContext';

function MyApp({ Component, pageProps }) {
  return (
    <NearProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </NearProvider>
  );
}

export default MyApp; 