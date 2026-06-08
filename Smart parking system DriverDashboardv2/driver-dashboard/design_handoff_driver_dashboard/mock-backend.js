// ============================================================
//  ParkChain — Mock backend / data layer  (DESIGN PROTOTYPE)
//  Everything here is SIMULATED. It is shaped to mirror the real
//  providers described in FRONTEND_INTEGRATION_GUIDE.md so Claude
//  Code can swap implementations without touching the UI.
//
//  REAL WIRING (replace stubs, keep signatures):
//   • SP.user            → AuthContext  useAuth().user
//   • SP.connectWallet   → AuthContext  connectWallet()
//   • SP.updateProfile   → AuthContext  updateProfile(formData)
//   • SP.getSpots        → ParkingContext useParking().spots (3s poll)
//   • SP.selectSpot      → ParkingContext selectSpot(id)
//   • SP.blockchain.payForSpot → blockchainService.payForSpot(id,totalEth)
//   • SP.api.saveReservation   → api.post('/reservations', …)
//   • SP.api.fetchHistory      → api.get('/reservations/history')
// ============================================================
(function () {
  const ETH_EUR = 2780; // demo conversion rate

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }
  function hash() {
    const h = "0123456789abcdef";
    let s = "0x";
    for (let i = 0; i < 64; i++) s += h[(Math.random() * 16) | 0];
    return s;
  }
  function shortAddr(a) { return a ? a.slice(0, 6) + "…" + a.slice(-4) : ""; }
  function shortHash(h) { return h ? h.slice(0, 10) + "…" + h.slice(-6) : ""; }
  function ethToEur(e) { return (e * ETH_EUR).toLocaleString("fr-FR", { maximumFractionDigits: 0 }); }
  function fmtEth(e) { return e.toLocaleString("fr-FR", { minimumFractionDigits: 3, maximumFractionDigits: 4 }); }

  // ---- demo user (first_name / email null → triggers profile modal) ------
  const user = {
    address: "0x7F3a9C2b18Ee4D5a6F0b1C2d3E4f5A6b7C8d3aB2",
    firstName: null,
    lastName: null,
    email: null,
    debt: 0.005,       // unpaid debt in ETH (added to next payment)
    balance: 1.842,    // wallet balance (demo)
    role: "driver",
    network: "Ganache · 1337",
  };

  // ---- tarification jour / nuit (ETH par heure) -------------------------
  // TODO(Claude Code): exposez ces taux depuis le smart contract / backend.
  const TARIF = {
    day:   { rate: 0.0009, label: "Jour", window: "06h – 20h", from: 6, to: 20 },
    night: { rate: 0.0006, label: "Nuit", window: "20h – 06h", from: 20, to: 6 },
  };
  function currentPeriod() {
    const h = new Date().getHours();
    return h >= TARIF.day.from && h < TARIF.day.to ? "day" : "night";
  }
  // prix d'une durée (minutes) selon la période (ETH)
  function computePrice(durationMin, period) {
    const rate = (TARIF[period] || TARIF.day).rate;
    return +(rate * (durationMin / 60)).toFixed(4);
  }
  function durLabel(min) {
    const h = Math.floor(min / 60), m = min % 60;
    if (h && m) return h + " h " + m;
    if (h) return h + " h";
    return m + " min";
  }

  // ---- parking lot: 2 rangées (A–B) × 8 = 16 places ---------------------
  const ROWS = ["A", "B"];
  function buildSpots() {
    const spots = [];
    let i = 0;
    for (let r = 0; r < ROWS.length; r++) {
      for (let c = 1; c <= 8; c++) {
        const rnd = Math.random();
        let status = "free";
        if (rnd > 0.76) status = "occupied";
        else if (rnd > 0.58) status = "reserved";
        spots.push({ id: "spot-" + i, index: i, label: ROWS[r] + c, status, level: "Niveau 1" });
        i++;
      }
    }
    return spots;
  }
  let spots = buildSpots();

  // ---- simulated real-time polling (ParkingContext does this server-side)
  // Flips 1–2 spots every 3s. Returns the new array.
  function tick() {
    const n = 1 + ((Math.random() * 2) | 0);
    for (let k = 0; k < n; k++) {
      const s = pick(spots);
      const states = ["free", "reserved", "occupied"];
      s.status = pick(states.filter((x) => x !== s.status));
    }
    spots = spots.map((s) => ({ ...s }));
    return spots;
  }

  // ---- reservation history (api.get('/reservations/history')) ------------
  const history = [
    { id: "r-1042", label: "B14", date: "2026-06-07 09:12", durationMin: 45, amountEth: 0.0015, status: "active",    txHash: hash() },
    { id: "r-1039", label: "A3",  date: "2026-06-05 18:40", durationMin: 120, amountEth: 0.004,  status: "completed", txHash: hash() },
    { id: "r-1031", label: "C7",  date: "2026-06-03 11:05", durationMin: 30,  amountEth: 0.001,  status: "completed", txHash: hash() },
    { id: "r-1024", label: "D2",  date: "2026-05-29 14:22", durationMin: 90,  amountEth: 0.006,  status: "completed", txHash: hash() },
    { id: "r-1018", label: "A8",  date: "2026-05-24 08:50", durationMin: 60,  amountEth: 0.0025, status: "completed", txHash: hash() },
    { id: "r-1009", label: "B1",  date: "2026-05-19 20:11", durationMin: 150, amountEth: 0.0075, status: "completed", txHash: hash() },
  ];

  // ---- service stubs (swap bodies for real ethers/axios) -----------------
  const blockchain = {
    // payForSpot(spotId, totalEth) → resolves with { txHash }
    // TODO(Claude Code): replace with ethers.js call to the smart contract:
    //   const tx = await contract.payForSpot(spotId, { value: parseEther(String(totalEth)) });
    //   const receipt = await tx.wait();  return { txHash: receipt.transactionHash };
    payForSpot(spotId, totalEth, onStep) {
      return new Promise((resolve) => {
        if (onStep) onStep(1);                          // MetaMask signature
        setTimeout(() => { if (onStep) onStep(2); }, 1500); // confirming on chain
        setTimeout(() => { if (onStep) onStep(3); resolve({ txHash: hash() }); }, 3400); // verified
      });
    },
  };

  const api = {
    // TODO(Claude Code): api.post('/reservations', { spot_id, transaction_hash, amount })
    saveReservation(payload) { return Promise.resolve({ ok: true, id: "r-" + ((Math.random() * 9000 + 1000) | 0) }); },
    // TODO(Claude Code): api.get('/reservations/history')
    fetchHistory() { return Promise.resolve(history); },
    // TODO(Claude Code): updateProfile → AuthContext.updateProfile(formData)
    updateProfile(form) {
      return new Promise((res) => setTimeout(() => {
        user.firstName = form.firstName; user.lastName = form.lastName; user.email = form.email;
        res({ ok: true });
      }, 900));
    },
  };

  window.SP = {
    ETH_EUR, user, history,
    TARIF, currentPeriod, computePrice, durLabel,
    getSpots: () => spots,
    tick,
    blockchain, api,
    // helpers
    hash, shortAddr, shortHash, ethToEur, fmtEth,
    GANACHE_EXPLORER: "http://localhost:8545/tx/", // demo explorer base
  };
})();
