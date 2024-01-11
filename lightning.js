const lnService = require("ln-service");
const { pay, getNetworkInfo } = require("ln-service");
const { config } = require("dotenv");
const axios = require("axios");
const { requestInvoice, utils } = require("lnurl-pay");

config();

const { lnd } = lnService.authenticatedLndGrpc({
  cert: "", // Voltage uses CA signed cerificates, like a browser/website. So there isn't a need to supply it in the code and it generally just confuses the application. - gkrizek (voltage Founder and CEO)
  macaroon: process.env.LND_MACAROON_B64,
  socket: process.env.LND_ADDRESS,
});

async function getInvoice(address, amount) {
  const { invoice } = await requestInvoice({
    lnUrlOrAddress: address, // ex. "{yourprofile}@stacker.news",
    tokens: amount,
  });

  return invoice;
}

async function decodeInvoice(invoice) {
  const details = await lnService.decodePaymentRequest({ lnd, request: invoice });
  return details;
}

async function getDateFromInvoiceDetails(invoiceDetails) {
  return new Date(invoiceDetails.expires_at).toLocaleString();
}

async function getWalletInfo() {
  // Bob is the seller, rendering a service (gig) to alice
  // Alice is the buyer
  // get invoice from bob
  const invoiceA = await getInvoice("{yourprofile}@stacker.news", 50);
  const invoice2 = await getInvoice("{yourfriendsprofile}@stacker.news", 50);

  // 2) Alice wants to pay for bobs gig. Bob gives You invoice A with amount X and payment hash J for alice to pay
  console.log(await getDateFromInvoiceDetails(await decodeInvoice(invoiceA)));
  console.log(await getDateFromInvoiceDetails(await decodeInvoice(invoice2)));

  const details = await decodeInvoice(invoiceA);

  const amountX = details.safe_tokens;
  const paymentHashJ = details.id;

  console.log(`Bob's invoice A:\r\n\t invoice amount: ${amountX}, payment hash: ${paymentHashJ}`);

  const fee = 5;

  // 4) You generate a hodl invoice B with amount X + F (fee) and payment hash J (<-- note same payment hash)
  // You give this invoice to alice to pay.
  const invoiceB = await lnService.createHodlInvoice({
    lnd,
    id: paymentHashJ,
    tokens: amountX + fee,
  });

  const invoiceBDetails = await lnService.decodePaymentRequest({ lnd, request: invoiceB.request });

  // 5) Alice pays invoice B. You cannot settle the payment because you don't have the preimage to hash J. only Bob does.
  // TODO some service to check if the invoice is paid
  // Alice is now waiting for bob to to the gig.

  // Alert bob that Alice has paid and he can begin the gig.
  // EXTERNAL : 6) Bob does job once he sees Alice has paid you.

  // Bob completes the gig, and delivers to alice. she confirms the job is done.
  // EXTERNAL: 7) Alice confirms job is done.

  // You pay out bobs invoice so that he gets paid
  // 8) You pay Bob's invoice A. Bob settles payment by giving you preimage to hash J.
  const result = await pay({ lnd, request: invoiceA });

  const preimage = result.secret;

  // you use the preimage from the payment to settle the hodl invoice
  // 9) You can then finally use preimage to settle Alice's payment to you.
  const settleResult = await lnService.settleHodlInvoice({
    lnd,
    secret: preimage,
  });

  console.log(settleResult);
}

getWalletInfo()
  .then((result) => {})
  .catch((err) => {
    console.log(err);
  });
