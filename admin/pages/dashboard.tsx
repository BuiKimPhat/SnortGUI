import { PageContainer } from '@keystone-6/core/admin-ui/components';
import { Heading } from '@keystone-ui/core';
import React from 'react';
/** @jsxRuntime classic */
/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import { NumberDotFormat } from '../../utils/format';
import { useState, useEffect } from 'react';
import { gql, ApolloClient, InMemoryCache } from '@apollo/client';

import {
    Chart as ChartJS,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

import io from 'socket.io-client';
const socket = io('http://192.168.1.70:8000'); // real-time alert socket

export default function DashBoard() {
    const [isConnected, setIsConnected] = useState(socket.connected); // real-time alert socket connection state
    const [alert, setAlert] = useState("");
    const [data, setData] = useState(null)
    const [isLoading, setLoading] = useState(false)

    // notify sound
    let lastSound = new Date().getTime();
    const interval = 5*1000; // 5 seconds
    const audio = new Audio('/images/notify.mp3');

    const handleRefresh = () => {
        fetch('http://192.168.1.70:8000/statistic')
        .then((res) => res.json())
        .then((data) => {
            setData(data)
            setLoading(false)
        })
    }


    useEffect(() => {
        setLoading(true)
        // fetch('http://192.168.1.70:8000/statistic')
        //     .then((res) => res.json())
        //     .then((data) => {
        //         setData(data)
        //         setLoading(false)
        //     });
        let startTime = new Date();
        startTime.setHours(startTime.getHours() - 6);
        const client = new ApolloClient({
            uri: 'http://192.168.1.70:3000/api/graphql',
            cache: new InMemoryCache()
          });
        const COUNT6H = gql`
        query Count6H($startTime: DateTime) {
            tcp: alertsCount(where: {
              protocol: {equals: "TCP"},
              timestamp: {gte: $startTime}
            }),
            icmp: alertsCount(where: {
              protocol: {contains: "ICMP"},
              timestamp: {gte: $startTime}
            }),
            udp: alertsCount(where: {
              protocol: {equals: "UDP"},
              timestamp: {gte: $startTime}
            }),
            arp: alertsCount(where: {
              protocol: {equals: "ARP"},
              timestamp: {gte: $startTime}
            })
          }
        `;
        const count = client.query({
            query: COUNT6H,
            variables: {
              startTime: startTime.toISOString()
            }
        }).then((data) => {
            setData(data)
            setLoading(false)
            console.log(data)
        }).catch(err => {
            console.log(err)
        })

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

    ChartJS.register(ArcElement, Tooltip, Legend);

    const labels = ['TCP', 'UDP', 'ICMP', 'ARP', 'Others'];
    const chartdata = {
        labels,
        datasets: [
            {
                label: 'Number of alerts',
                data: [data ? data.data.tcp : 0, data ? data.udp : 0, data ? data.icmp : 0, data ? data.arp : 0, data ? data.all - data.ip : 0],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1,
            },
        ],
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
                    .card {
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
                        margin: 1rem 0 0 4rem;
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
                <button className='btn-success' type="button" onClick={() => handleRefresh()}>Refresh</button>
                <div className='row'>
                    <div className='col-4'>
                        <div className="card row">
                            <div className="card-body row">
                                <div><span className='card-title' style={{
                                    color: "#903749"
                                }}><FontAwesomeIcon icon={faTriangleExclamation} />Total alerts</span></div>
                                <div><span className='card-number' style={{
                                    color: "#E84545"
                                }}>{NumberDotFormat(data.all)}</span></div>
                            </div>
                        </div>
                    </div>
                    <div className='col-4'>
                        <div className="card row">
                            <div className="card-body row">
                                <div><span className='card-title'><FontAwesomeIcon icon={faNetworkWired} /> IP alerts</span></div>
                                <div><span className='card-number'>{NumberDotFormat(data.ip)}</span></div>
                            </div>
                        </div>
                    </div>
                    <div className='col-4'>
                        <div className="card row">
                            <div className="card-body row">
                                <div><span className='card-title'><FontAwesomeIcon icon={faNetworkWired} /> TCP alerts</span></div>
                                <div><span className='card-number'>{NumberDotFormat(data.tcp)}</span></div>
                            </div>
                        </div>
                    </div>
                    <div className='col-4'>
                        <div className="card row">
                            <div className="card-body row">
                                <div><span className='card-title'><FontAwesomeIcon icon={faNetworkWired} /> ICMP alerts</span></div>
                                <div><span className='card-number'>{NumberDotFormat(data.icmp)}</span></div>
                            </div>
                        </div>
                    </div>
                    <div className='col-4'>
                        <div className="card row">
                            <div className="card-body row">
                                <div><span className='card-title'><FontAwesomeIcon icon={faNetworkWired} /> UDP alerts</span></div>
                                <div><span className='card-number'>{NumberDotFormat(data.udp)}</span></div>
                            </div>
                        </div>
                    </div>
                    <div className='col-4'>
                        <div className="card row">
                            <div className="card-body row">
                                <div><span className='card-title'><FontAwesomeIcon icon={faNetworkWired} /> ARP alerts</span></div>
                                <div><span className='card-number'>{NumberDotFormat(data.arp)}</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{
                    margin: "1.5rem",
                }}>
                    <Doughnut height="400px" width="400px" options={{ maintainAspectRatio: false }} data={chartdata} />
                </div>
            </>
        </PageContainer >
    )
}