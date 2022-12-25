import { PageContainer } from '@keystone-6/core/admin-ui/components';
import { Heading } from '@keystone-ui/core';
import React from 'react';
/** @jsxRuntime classic */
/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import { NumberDotFormat } from '../../utils/format';
import { useState, useEffect, useRef } from 'react';
import { gql, ApolloClient, InMemoryCache } from '@apollo/client';

import {
    Chart as ChartJS,
    Tooltip,
    Legend,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';


import io from 'socket.io-client';
const socket = io('http://192.168.1.70:8000'); // real-time alert socket

export default function DashBoard() {
    const [isConnected, setIsConnected] = useState(socket.connected); // real-time alert socket connection state
    const [alert, setAlert] = useState("");
    const [data, setData] = useState(null);
    const [barData, setBarData] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const chartRef = useRef<ChartJS>(null);

    // notify sound
    let lastSound = new Date().getTime();
    const interval = 5 * 1000; // 5 seconds
    const audio = new Audio('/images/notify.mp3');

    const fetchCounts = (startTime, endTime) => {
        const client = new ApolloClient({
            uri: 'http://192.168.1.70:3000/api/graphql',
            cache: new InMemoryCache()
        });
        const FETCH_COUNTS = gql`
        query FetchCounts($startTime: DateTime, $endTime: DateTime) {
            all: alertsCount(where: {
                timestamp: {gt: $startTime, lte: $endTime}
            }),
            tcp: alertsCount(where: {
                protocol: {equals: "TCP"},
                timestamp: {gt: $startTime, lte: $endTime}
            }),
            icmp: alertsCount(where: {
                protocol: {contains: "ICMP"},
                timestamp: {gt: $startTime, lte: $endTime}
            }),
            udp: alertsCount(where: {
                protocol: {equals: "UDP"},
                timestamp: {gt: $startTime, lte: $endTime}
            })          
        }
        `;
        return client.query({
            query: FETCH_COUNTS,
            variables: {
                startTime: startTime,
                endTime: endTime
            }
        })
    }

    const fetchBarChartData = (minsAgo, nbins) => {
        const binlen = Math.ceil((minsAgo*60000)/nbins); // miliseconds 
        const msNow = new Date().getTime();
        var startTime = new Date(msNow-minsAgo*60000);
        const tcp = [];
        const udp = [];
        const icmp = [];
        const others = [];
        const labels = [];
        for (let i = 0; i < nbins; i++){
            const endTime = new Date(startTime.getTime() + binlen);
            labels.push(startTime.getHours()+':'+startTime.getMinutes()+" - "+endTime.getHours()+":"+endTime.getMinutes());

            fetchCounts(startTime.toISOString(), endTime.toISOString())
            .then((data) => {
                tcp.push(data.data.tcp)
                udp.push(data.data.udp)
                icmp.push(data.data.icmp)
                others.push(data.data.all-data.data.tcp-data.data.udp-data.data.icmp)
            })
            .catch(err => {
                console.log('chart err: ' + err)
            });
            startTime = endTime;
        }
        const result = {
            labels,
            datasets: [
                {
                    label: 'TCP',
                    data: tcp,
                    backgroundColor: 'rgb(255, 99, 132)',
                },
                {
                    label: 'UDP',
                    data: udp,
                    backgroundColor: 'rgb(75, 192, 192)',
                },
                {
                    label: 'ICMP',
                    data: icmp,
                    backgroundColor: 'rgb(53, 162, 235)',
                },
                {
                    label: 'Others',
                    data: others,
                    backgroundColor: 'rgb(53, 162, 235)',
                },
            ],
        };
        setBarData(result);
    }

    const handleRefresh = () => {
        let startTime = new Date();
        startTime.setHours(startTime.getHours() - 6);
        const endTime = new Date();
        fetchCounts(startTime.toISOString(), endTime.toISOString())
        .then((data) => {
            setData(data.data)
            setLoading(false);
        })
        .catch(err => {
            console.log(err)
        });

        fetchBarChartData(12*60, 20);

        setTimeout(() => {
            const chart = chartRef.current;
            chart?.update();
        }, 1000)
    }

    useEffect(() => {
        setLoading(true)
        handleRefresh();

        // socketio
        socket.on('connect', () => {
            setIsConnected(true);
        });
        socket.on('disconnect', () => {
            setIsConnected(false);
        });
        socket.on('new alert', (data) => {
            setAlert(data);

            // notify interval
            let currentTime = new Date().getTime();
            if (currentTime - lastSound >= interval) {
                audio.play();
                lastSound = currentTime;
            }
        });
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('new alert');
        };

    }, [])

    // Charts
    ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);
    const labels = ['TCP', 'UDP', 'ICMP', 'Others'];
    const chartdata = {
        labels,
        datasets: [
            {
                label: 'Number of alerts',
                data: [data ? data.tcp : 0, data ? data.udp : 0, data ? data.icmp : 0, data ? (data.all - data.tcp - data.udp - data.icmp) : 0],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
            },
        },
    };

    if (isLoading) return <PageContainer header={<Heading type="h2">Snort Dashboard</Heading>}><p>Loading...</p></PageContainer>
    if (!data) return <PageContainer header={<Heading type="h2">Snort Dashboard</Heading>}><p>No data</p></PageContainer>

    return (
        <PageContainer header={<Heading type="h2">Snort Dashboard</Heading>}>
            <>
                <style jsx>{`
                    .row {
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: center;
                        align-items: center;
                    }
                    .col-4 {
                        width: 300px;
                        margin: 1.5rem;
                    }
                    .col-8 {
                        width: 650px;
                        margin: 0.5rem;
                    }
                    .card {
                        margin: 0.25rem;
                        width: 100%;
                        height: 100%;
                        cursor: pointer;
                        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
                        transition: 0.3s;
                        border-radius: 8px;
                        text-align: center;
                    }
                    .card:hover {
                        box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
                    }
                    .card-body {
                        height: 100%;
                        width: 100%;
                        padding: 0.5rem 2rem;
                    }
                    .card-body > div {
                        padding: 0.5rem;
                    }
                    .card-title {
                        font-size: 1.5rem;
                        color: #364F6B;
                    }
                    .card-number {
                        font-size: 3rem;
                        font-weight: bold;
                        color: #3FC1C9;
                    }

                    .btn-success {
                        margin: 1rem 1rem;
                        background-color: #04AA6D;
                        border: 1px solid green;
                        border-radius: 5px;
                        color: white;
                        padding: 8px;
                        cursor: pointer;
                    }
    

                    .alert {
                        padding: 15px 20px;
                        background-color: #3FC1C9;
                        color: white;
                        margin-bottom: 15px;
                        opacity: 1;
                        transition: opacity 0.6s;
                      }
                    .closebtn {
                        margin-left: 15px;
                        color: white;
                        font-weight: bold;
                        float: right;
                        font-size: 22px;
                        line-height: 20px;
                        cursor: pointer;
                        transition: 0.3s;
                    }
                    .closebtn:hover {
                        color: black;
                    }
                `}</style>
                <div className='alert-box'>
                    {!alert || alert == "" ? "" : (
                        <div className="alert">
                            <span className="closebtn" onClick={e => e.currentTarget.parentElement.style.display = 'none'}>&times;</span>
                            {alert}
                        </div>
                    )}
                </div>
                Showing alerts since 12 hours ago... <button className='btn-success' type="button" onClick={() => handleRefresh()}>Refresh</button>
                <div className='row'>
                    <div className='col-8'>
                        <div className='row'>
                            <div className='col-6'>
                                <div className="card row">
                                    <div className="card-body row">
                                        <div><span className='card-title'><FontAwesomeIcon icon={faNetworkWired} /> All alerts</span></div>
                                        <div><span className='card-number'>{NumberDotFormat(data.all)}</span></div>
                                    </div>
                                </div>
                            </div>
                            <div className='col-6'>
                                <div className="card row">
                                    <div className="card-body row">
                                        <div><span className='card-title'><FontAwesomeIcon icon={faNetworkWired} /> TCP alerts</span></div>
                                        <div><span className='card-number'>{NumberDotFormat(data.tcp)}</span></div>
                                    </div>
                                </div>
                            </div>
                            <div className='col-6'>
                                <div className="card row">
                                    <div className="card-body row">
                                        <div><span className='card-title'><FontAwesomeIcon icon={faNetworkWired} /> ICMP alerts</span></div>
                                        <div><span className='card-number'>{NumberDotFormat(data.icmp)}</span></div>
                                    </div>
                                </div>
                            </div>
                            <div className='col-6'>
                                <div className="card row">
                                    <div className="card-body row">
                                        <div><span className='card-title'><FontAwesomeIcon icon={faNetworkWired} /> UDP alerts</span></div>
                                        <div><span className='card-number'>{NumberDotFormat(data.udp)}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col-4'>
                        <div style={{
                            margin: "1.5rem",
                        }}>
                            <Doughnut height="400px" width="400px" data={chartdata} />
                        </div>
                    </div>
                </div>
                <div style={{
                    margin: "1.5rem",
                }}>
                    <Bar ref={chartRef} options={options} data={barData} />
                </div>
            </>
        </PageContainer >
    )
}