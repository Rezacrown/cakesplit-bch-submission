# Build with XO — Developer Feedback (CakeSplit)

- **Project:** CakeSplit — BCH BLAZE 2026
- **Live Mainnet App:** https://cakesplit-bch.vercel.app
- **Public Repository:** https://github.com/Rezacrown/cakesplit-bch-submission
- **XO Template ID:** `c52aac6dcb3a27a8d2f915f1c20fbf806548041e2ea88f6abc6fcca9cd8f4755`
- **Verified Mainnet `settleBill` TxID:** `8729bb2c7cf880a7496e662233aa21612dabafefe20772f82c8ae39aecefb6ff`

---

Honestly, building CakeSplit for BCH BLAZE 2026 was really interesting for me because I am completely new to Bitcoin Cash. Coming from an EVM background, I initially thought BCH smart contracts would be complicated since I would have to relearn everything in a new language. In EVM we are used to contract storage, so jumping into BCH felt confusing at first. After learning bit by bit and asking AI to break down the concepts, the UTXO model actually became the coolest thing I discovered here. Seeing that it works like tx-to-tx, where your balance is the accumulation of funds across the transactions you have done, finally made sense to me. I still find it a bit hard to explain in technical terms, but I get the big picture now. What surprised me even more is that you do not need to deploy contracts first like on EVM. Since the XO SDK already handles the setup, I could focus straight on building the app end-to-end instead of configuring deployment environments.

At first, I had no idea what blaze.xo.cash was for. I could not picture how it worked until I imported our CakeSplit template JSON and loaded an invitation. Once the UI rendered it almost like callable functions, it immediately clicked. It felt very similar to the read/write contract viewer in Remix IDE on EVM (I forgot the exact name of that panel). After that, inspecting and debugging our contract became much easier to understand.

Compared to other chains where you need a lot of setup just to get started, I barely hit any friction here. Using AI alongside the SDK also helped me move fast. The main bug I ran into was a "Missing inputs" error when testing the "Pay Cashier Now" settlement button, which turned out to be a minor issue in the input handling during validation and was quick to fix once we noticed it.

Testing live on BCH Mainnet was also a great experience. Even though it is real Mainnet, the fees are very cheap and testing felt easy. The only part that felt slow was waiting for transactions to confirm, plus deciding which wallet to use at the beginning. Unlike other chains, I could not find a browser extension for Microsoft Edge, so after looking around I just went with Cashonize haha. Overall, once set up, testing on Mainnet went smoothly.

My biggest suggestion for the XO and BCH team is to create an updated YouTube video playlist for developers. Most BCH tutorials I found were already around two years old, so a fresh walkthrough from beginner setup up to more advanced apps like DeFi and RWA would really help. Since BCH smart contracts follow an input, validation, and output approach, seeing real examples on video makes it much easier for new devs to adapt instead of only reading docs, which most people get lazy to finish lol. Because CakeSplit was genuinely fun and easy to debug and integrate with XO, I will definitely use XO again for my next Bitcoin Cash project.
