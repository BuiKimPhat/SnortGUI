import { PageContainer } from '@keystone-6/core/admin-ui/components';
import { Heading } from '@keystone-ui/core';
import React from 'react';
import { useEffect } from 'react';
/** @jsxRuntime classic */
/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import { NumberDotFormat } from '../../utils/format';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        title: {
            display: true,
            text: 'Chart.js Line Chart',
        },
    },
};

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

export const data = {
    labels,
    datasets: [
        {
            label: 'Dataset 1',
            data: [69, 100, 20, 1, 0, 4, 70, 50],
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
            label: 'Dataset 2',
            data: [50, 70, 4, 0, 1, 20, 100, 69],
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
    ],
};


export default function DashBoard() {
    return (
        <PageContainer header={<Heading type="h2">Snort Dashboard</Heading>}>
            <div className='row'>
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
                `}</style>
                <div className='col-4'>
                    <div className="card row">
                        <div className="card-body row">
                            <div><span className='card-title' style={{
                                color: "#903749"
                            }}><FontAwesomeIcon icon={faTriangleExclamation} />Total alerts</span></div>
                            <div><span className='card-number' style={{
                                color: "#E84545"
                            }}>{NumberDotFormat(221)}</span></div>
                        </div>
                    </div>
                </div>
                <div className='col-4'>
                    <div className="card row">
                        <div className="card-body row">
                            <div><span className='card-title'><FontAwesomeIcon icon={faNetworkWired} /> IP alerts</span></div>
                            <div><span className='card-number'>{NumberDotFormat(50)}</span></div>
                        </div>
                    </div>
                </div>
                <div className='col-4'>
                    <div className="card row">
                        <div className="card-body row">
                            <div><span className='card-title'><FontAwesomeIcon icon={faNetworkWired} /> TCP alerts</span></div>
                            <div><span className='card-number'>{NumberDotFormat(15)}</span></div>
                        </div>
                    </div>
                </div>
                <div className='col-4'>
                    <div className="card row">
                        <div className="card-body row">
                            <div><span className='card-title'><FontAwesomeIcon icon={faNetworkWired} /> ICMP alerts</span></div>
                            <div><span className='card-number'>{NumberDotFormat(69)}</span></div>
                        </div>
                    </div>
                </div>
                <div className='col-4'>
                    <div className="card row">
                        <div className="card-body row">
                            <div><span className='card-title'><FontAwesomeIcon icon={faNetworkWired} /> UDP alerts</span></div>
                            <div><span className='card-number'>{NumberDotFormat(87)}</span></div>
                        </div>
                    </div>
                </div>
                <div className='col-4'>
                    <div className="card row">
                        <div className="card-body row">
                            <div><span className='card-title'><FontAwesomeIcon icon={faNetworkWired} /> ARP alerts</span></div>
                            <div><span className='card-number'>{NumberDotFormat(18)}</span></div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{
                margin: "1.5rem"
            }}>
                <Line options={options} data={data} />
            </div>
        </PageContainer>
    )
}