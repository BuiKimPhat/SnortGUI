import { PageContainer } from '@keystone-6/core/admin-ui/components';
import { Heading } from '@keystone-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
/** @jsxRuntime classic */
/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { faArrowUpAZ } from '@fortawesome/free-solid-svg-icons';

export default function Detail({ alerts }: InferGetStaticPropsType<typeof getStaticProps>) {
    return (
        <PageContainer header={<Heading type="h2">Alert details</Heading>}>
            <div>
                <style jsx>{`
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
            `}</style>
                <div className='toolbar'>
                    <label htmlFor="filter">Filter:</label>
                    <select name='filter'>
                        <option value="all">All</option>
                        <option value="ip">IP</option>
                        <option value="tcp">TCP</option>
                        <option value="udp">UDP</option>
                        <option value="icmp">ICMP</option>
                        <option value="arp">ARP</option>

                    </select>
                </div>
                <table id="customers">
                    <tr>
                        <th><a><FontAwesomeIcon icon={faArrowUpAZ} /> Alert</a></th>
                        <th><a><FontAwesomeIcon icon={faArrowUpAZ} /> Source IP</a></th>
                        <th><a><FontAwesomeIcon icon={faArrowUpAZ} /> Destination IP</a></th>
                    </tr>
                    <tr>
                        <td>Alfreds Futterkiste</td>
                        <td>Maria Anders</td>
                        <td>Germany</td>
                    </tr>
                    <tr>
                        <td>Berglunds snabbköp</td>
                        <td>Christina Berglund</td>
                        <td>Sweden</td>
                    </tr>
                    <tr>
                        <td>Centro comercial Moctezuma</td>
                        <td>Francisco Chang</td>
                        <td>Mexico</td>
                    </tr>
                    <tr>
                        <td>Ernst Handel</td>
                        <td>Roland Mendel</td>
                        <td>Austria</td>
                    </tr>
                    <tr>
                        <td>Island Trading</td>
                        <td>Helen Bennett</td>
                        <td>UK</td>
                    </tr>
                    <tr>
                        <td>Königlich Essen</td>
                        <td>Philip Cramer</td>
                        <td>Germany</td>
                    </tr>
                    <tr>
                        <td>Laughing Bacchus Winecellars</td>
                        <td>Yoshi Tannamuri</td>
                        <td>Canada</td>
                    </tr>
                    <tr>
                        <td>Magazzini Alimentari Riuniti</td>
                        <td>Giovanni Rovelli</td>
                        <td>Italy</td>
                    </tr>
                    <tr>
                        <td>North/South</td>
                        <td>Simon Crowther</td>
                        <td>UK</td>
                    </tr>
                    <tr>
                        <td>Paris spécialités</td>
                        <td>Marie Bertrand</td>
                        <td>France</td>
                    </tr>
                </table>
            </div>
        </PageContainer>
    )
}

export async function getStaticProps() {
    const res = await fetch('localhost:5000/alerts')
    const posts = await res.json()
    return {
      props: {
        alerts
      },
    };
  }