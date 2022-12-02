import { PageContainer } from '@keystone-6/core/admin-ui/components';
import { Heading } from '@keystone-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

import { faArrowUpAZ } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { quickSortByTime } from '../../utils/sort.js'

export default function Detail() {
    const [data, setData] = useState(null)
    const [isLoading, setLoading] = useState(false)
    const [display, setDisplay] = useState(null)
    const [filter, setFilter] = useState("all")
    const [timeAsc, setTimeAsc] = useState(true)

    const filterDisplay = fil => {
        if (data == null) return;
        let tmp = [];
        if (fil == "all") {
            setDisplay(data);
            return;
        } else if (fil == "IP") {
            data.forEach(d => {
                if (d.prot == "IP" || d.prot == "TCP" || d.prot == "UDP" || d.prot == "ICMP" || d.prot == "ARP"){
                    tmp.push(d);
                }
            });    
        } else {
            data.forEach(d => {
                if (d.prot == fil){
                    tmp.push(d);
                }
            });    
        }
        setDisplay(tmp);
    }

    const handleFilterChange = e => {
        setFilter(e.target.value);
        filterDisplay(e.target.value);
    }

    const handleRefresh = () => {
        fetch('http://192.168.118.128:8000/alerts')
        .then((res) => res.json())
        .then((data) => {
            setData(data);
            filterDisplay(filter);
            setLoading(false);
        })
    }

    const fetchData = () => {
        setLoading(true)
        fetch('http://192.168.118.128:8000/alerts')
            .then((res) => res.json())
            .then((data) => {
                setData(data)
                setDisplay(data)
                setLoading(false)
            })
    }

    useEffect(() => {
        fetchData();
    }, [])

    if (isLoading) return <PageContainer header={<Heading type="h2">Alert details</Heading>}><p>Loading...</p></PageContainer>
    if (!data) return <PageContainer header={<Heading type="h2">Alert details</Heading>}><p>No data</p></PageContainer>

    return (
        <PageContainer header={<Heading type="h2">Alert details</Heading>}>
            <div>
                <style>{`
                #customers {
                    border-collapse: collapse;
                    width: 100%;
                }
            
                #customers td, #customers th {
                    border: 1px solid #ddd;
                    padding: 8px;
                }
            
                #customers tr:nth-child(even){background-color: #f2f2f2;}
            
                #customers tr:hover {background-color: #ddd;}
            
                #customers th {
                    padding-top: 12px;
                    padding-bottom: 12px;
                    text-align: left;
                    background-color: #3FC1C9;
                    color: white;
                }
                .toolbar {
                    margin: 1rem 0;
                }
                .toolbar select {
                    margin-left: 1rem;
                    border: 1px solid black;
                    border-radius: 5px;
                }
                th > a {
                    color: white;
                    cursor: pointer;
                }
                th > a:hover {
                    color: #364F6B;
                }
                .btn-success {
                    margin-left: 2rem;
                    background-color: #04AA6D;
                    border: 1px solid green;
                    border-radius: 5px;
                    color: white;
                    padding: 8px;
                    cursor: pointer;
                }
            `}</style>
                <div className='toolbar'>
                    <label htmlFor="filter">Filter:</label>
                    <select name='filter' value={filter} onChange={e => handleFilterChange(e)}>
                        <option value="all">All</option>
                        <option value="IP">IP</option>
                        <option value="TCP">TCP</option>
                        <option value="UDP">UDP</option>
                        <option value="ICMP">ICMP</option>
                        <option value="ARP">ARP</option>
                    </select>
                    <button className='btn-success' type="button" onClick={() => handleRefresh()}>Refresh</button>
                </div>
                <table id="customers">
                    <thead>
                        <tr>
                            <th><a><FontAwesomeIcon icon={faArrowUpAZ} /> Timestamp</a></th>
                            <th><a><FontAwesomeIcon icon={faArrowUpAZ} /> Protocol</a></th>
                            <th><a><FontAwesomeIcon icon={faArrowUpAZ} /> Message</a></th>
                            <th><a><FontAwesomeIcon icon={faArrowUpAZ} /> Source IP</a></th>
                            <th><a><FontAwesomeIcon icon={faArrowUpAZ} /> Destination IP</a></th>
                        </tr>
                    </thead>

                    <tbody>
                        {display.map((row,i) => (
                        <tr key={i}>
                            <td>{row.time}</td>
                            <td>{row.prot}</td>
                            <td>{row.mess}</td>
                            <td>{row.src}</td>
                            <td>{row.dest}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </PageContainer>
    )
}