import {useState} from 'react';
import {
  extend,
  render,
  useExtensionInput,
  BlockStack,
  Button,
  CalloutBanner,
  Heading,
  TextField,
  Text,
  Layout,
} from '@shopify/post-purchase-ui-extensions-react';

extend('Checkout::PostPurchase::ShouldRender', async () => {
  return {render: true};
});

render('Checkout::PostPurchase::Render', () => <App />);

export function App() {
  const {done, inputData} = useExtensionInput();
  const [state, setState] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);

  function acceptOffer() {
    async function doAcceptOrder() {
      // This is where you would call your api :)
      await fetch('http://localhost:3000/send-text', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          number: phoneNumber,
          productTitle: inputData.initialPurchase.lineItems[0].product.title,
        }),
      });
      done();
    }

    // Set state to update the UI, then call the async function
    setState('ACCEPTING');
    doAcceptOrder();
  }

  function declineOffer() {
    setState('DECLINING');
    done();
  }

  return (
    <BlockStack spacing="xloose">
      <CalloutBanner border="none" background="transparent" alignment="center">
        <BlockStack>
          <Heading level="1">Reorder with SMS</Heading>
          <Text size="small">
            Receive important order updates and replenish your stock of{' '}
            <Text size="small" emphasized>
              {inputData.initialPurchase.lineItems[0].product.title}
            </Text>
            , with a 5% discount!
          </Text>{' '}
        </BlockStack>
      </CalloutBanner>
      <Layout
        media={[
          {viewportSize: 'small', sizes: [1, 0, 1], maxInlineSize: 0.9},
          {viewportSize: 'medium', sizes: [532, 0, 1], maxInlineSize: 420},
          {viewportSize: 'large', sizes: [560, 38, 340]},
        ]}
      >
        <BlockStack>
          <TextField
            value={phoneNumber}
            onChange={(val) => setPhoneNumber(val)}
            type="telephone"
            label="Enter phone number"
          />
          <Buttons
            state={state}
            onAcceptPressed={acceptOffer}
            onDeclinePressed={declineOffer}
          />
        </BlockStack>
      </Layout>
    </BlockStack>
  );
}

function Buttons({state, onAcceptPressed, onDeclinePressed}) {
  return (
    <BlockStack>
      <Button
        onPress={onAcceptPressed}
        submit
        disabled={state !== null}
        loading={state === 'ACCEPTING'}
      >
        Yes, let's make this easy
      </Button>
      <Button
        onPress={onDeclinePressed}
        subdued
        disabled={state !== null}
        loading={state === 'DECLINING'}
      >
        No thanks
      </Button>
    </BlockStack>
  );
}
