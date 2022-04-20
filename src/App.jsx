import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import abi from './utils/WavePortal.json';

export default function App() {
	const [inputMessage, setInputMessage] = useState('');
	const [currentAccount, setCurrentAccount] = useState(null);
	const [totalWaves, setTotalWaves] = useState(null);
	const [allWaves, setAllWaves] = useState([]);
	const [isMining, setIsMining] = useState(false);

	const contractAddress = '0xa8fBD49Ec9664461c0dBD5874FA70e6a11dF0fe7';
	const contractABI = abi.abi;

	const onNewWave = (from, timestamp, message) => {
		console.log('NewWave', from, timestamp, message);
		setAllWaves(state => [
			...state,
			{
				address: from.toString(),
				timestamp: new Date(timestamp * 1000).toString(),
				message: message
			}
		]);
	};

	const compareTimestamps = (waveA, waveB) => {
		if (waveA.timestamp > waveB.timestamp) {
			return -1;
		}
		if (waveA.timestamp < waveB.timestamp) {
			return 1;
		}
		return 0;
	};

	const wave = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert('Install Metamask!');
				return;
			}

			const accounts = await ethereum.request({
				method: 'eth_requestAccounts'
			});

			const account = accounts[0];
			console.log('Connected', account);
			setCurrentAccount(account);

			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const wavePortalContract = new ethers.Contract(
				contractAddress,
				contractABI,
				signer
			);

			const waveTxn = await wavePortalContract.wave(inputMessage, {
				gasLimit: 1000000
			});
			console.log('Mining: ', waveTxn.hash);
			setIsMining(true);

			await waveTxn.wait();
			console.log('Mined!', waveTxn.hash);
			setIsMining(false);

			const waves = await wavePortalContract.getAllWaves();
			setTotalWaves(waves.length);

			const processedWaves = waves.map(wave => {
				return {
					address: wave.waver.toString(),
					timestamp: new Date(wave.timestamp * 1000).toString(),
					message: wave.message
				};
			});
			setAllWaves(processedWaves);
		} catch (error) {
			console.log(error);
			alert('Mining your wave transaction failed!');
			setIsMining(false);
		}
	};

	const checkWalletConnection = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				console.log('Install MetaMask!');
				alert('MetaMask needed to use this site!');
			} else {
				console.log('Ethereum object found!', ethereum);
			}

			const accounts = await ethereum.request({ method: 'eth_accounts' });

			if (accounts.length !== 0) {
				const account = accounts[0];
				console.log('Found authorized account!', account);
				setCurrentAccount(account);
			} else {
				console.log('No authorized account found!');
			}
		} catch (error) {
			console.error(error);
		}
	};

	const getAllWaves = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert('Install Metamask!');
				return;
			}

			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const wavePortalContract = new ethers.Contract(
				contractAddress,
				contractABI,
				signer
			);

			const waves = await wavePortalContract.getAllWaves();
			const processedWaves = waves.map(wave => {
				return {
					address: wave.waver,
					timestamp: new Date(wave.timestamp * 1000),
					message: wave.message
				};
			});
			setAllWaves(processedWaves);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		let wavePortalContract;

		if (window.ethereum) {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();

			wavePortalContract = new ethers.Contract(
				contractAddress,
				contractABI,
				signer
			);
			wavePortalContract.on('NewWave', onNewWave);
		}

		return () => {
			if (wavePortalContract) {
				wavePortalContract.off('NewWave', onNewWave);
			}
		};
	}, []);

	useEffect(() => {
		checkWalletConnection();
		getAllWaves();
	}, []);

	return (
		<div className="mainContainer">
			<div className="dataContainer">
				<a
					href="https://open.spotify.com/artist/3pmjwXacGPNkhiROvf9K9V?si=FgDX8pSRRlCY0WCdXyaKuw"
					target="_blank"
				>
					<img
						className="logo"
						src="https://raw.githubusercontent.com/numoonchld/numoonchld.github.io/master/media/spectrum-support-cropped.png"
						alt="numoonchld"
					/>
				</a>

				<div className="bio">
					<a
						href="https://open.spotify.com/artist/3pmjwXacGPNkhiROvf9K9V?si=FgDX8pSRRlCY0WCdXyaKuw"
						target="_blank"
					>
						numoonchld
					</a>
					<br />
					#progressive
					<br />
					#EDM
					<br />
					<br />
					<iframe
						style={{ borderRadius: '12px', margin: '10px 0px 0px 0px' }}
						src="https://open.spotify.com/embed/artist/3pmjwXacGPNkhiROvf9K9V?utm_source=generator"
						width="100%"
						height="300"
						frameBorder="0"
						allowFullScreen=""
						allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
					/>
					<br />
					{!isMining && (
						<div className="waveTile">
							<textarea
								className="waveMessage"
								placeholder="thoughts?"
								value={inputMessage}
								onChange={event => setInputMessage(event.target.value)}
								rows="5"
								required
							/>
							<button className="waveButton" onClick={wave}>
								<div>Wave at Me</div>
								<small className="totalWaves">{allWaves.length}</small>
							</button>
							<small>(ETH wallet signature required)</small>
						</div>
					)}
					{isMining && (
						<>
							<div className="miningSpinner" />
						</>
					)}
				</div>

				<div className="waveTable">
					<b style={{ marginBottom: '2%' }}>Wave Log</b>
					{allWaves.sort(compareTimestamps).map(wave => (
						<div key={Date.parse(wave.timestamp)} className="waveTableEntry">
							<small>{wave.address}</small>
							<small>{wave.timestamp.toDateString()}</small>
							<hr style={{ width: '100%' }} />
							{wave.message ? wave.message : '<blank message>'}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
