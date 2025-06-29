import React, { useState } from "react";
import "./styles.css";

export default function App() {
  const [oracle, setOracle] = useState(6.25);
  const [dv01, setDv01] = useState(0);
  const [direction, setDirection] = useState("Pay Fixed");
  const [netOi, setNetOi] = useState(0);
  const [trades, setTrades] = useState([]);

  const k = 0.00001;
  const feeFull = 0.0005;
  const feeHalf = 0.00025;

  const handleTrade = () => {
    const dv = parseFloat(dv01);
    if (!dv || dv <= 0) return;

    const dvSigned = direction === "Pay Fixed" ? dv : -dv;
    const netOiBefore = netOi;
    const netOiAfter = netOi + dvSigned;
    const midpointOi = (netOiBefore + netOiAfter) / 2;

    const entryApy = oracle + midpointOi * k;
    const reducesRisk = Math.abs(netOiAfter) < Math.abs(netOiBefore);
    const fee = reducesRisk ? feeHalf : feeFull;
    const execApy = direction === "Pay Fixed" ? entryApy + fee : entryApy - fee;
    const margin = dv * 20;
    const liquidation = direction === "Pay Fixed" ? entryApy - 0.2 : entryApy + 0.2;

    const newTrade = {
      id: trades.length + 1,
      direction,
      dv01: dv,
      netOiAfter,
      entryApy: (entryApy * 100).toFixed(3) + "%",
      execApy: (execApy * 100).toFixed(3) + "%",
      margin: `$${margin.toLocaleString()}`,
      liquidation: (liquidation * 100).toFixed(3) + "%",
      halfFee: reducesRisk ? "✅" : ""
    };

    setTrades([...trades, newTrade]);
    setNetOi(netOiAfter);
    setDv01("");
  };

  const resetSim = () => {
    setNetOi(0);
    setTrades([]);
  };

  return (
    <div className="App">
      <h1>Slope DV01 Trading Simulator</h1>
      <div>
        <label>Oracle APY (%): </label>
        <input
          type="number"
          value={oracle}
          step="0.01"
          onChange={(e) => setOracle(parseFloat(e.target.value))}
        />
      </div>
      <div>
        <label>DV01: </label>
        <input
          type="number"
          value={dv01}
          onChange={(e) => setDv01(e.target.value)}
        />
      </div>
      <div>
        <select value={direction} onChange={(e) => setDirection(e.target.value)}>
          <option>Pay Fixed</option>
          <option>Receive Fixed</option>
        </select>
        <button onClick={handleTrade}>Trade</button>
        <button onClick={resetSim} style={{ marginLeft: "10px" }}>
          Reset
        </button>
      </div>
      <h3>Trade History</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Direction</th>
            <th>DV01</th>
            <th>Net OI</th>
            <th>Entry APY</th>
            <th>Exec APY</th>
            <th>Margin</th>
            <th>Liquidation APY</th>
            <th>Half Fee?</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.direction}</td>
              <td>{t.dv01}</td>
              <td>{t.netOiAfter}</td>
              <td>{t.entryApy}</td>
              <td>{t.execApy}</td>
              <td>{t.margin}</td>
              <td>{t.liquidation}</td>
              <td>{t.halfFee}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
