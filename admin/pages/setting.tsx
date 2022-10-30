import { PageContainer } from '@keystone-6/core/admin-ui/components';
import { Heading } from '@keystone-ui/core';
import React from 'react';
/** @jsxRuntime classic */
/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core';

export default function DashBoard() {
  return (
    <PageContainer header={<Heading type="h2">Snort Setting</Heading>}>
      <div>
        <style jsx>{`
                    /* The switch - the box around the slider */
                    .switch {
                      position: relative;
                      display: inline-block;
                      width: 60px;
                      height: 34px;
                      margin: 1rem;
                    }
                    
                    /* Hide default HTML checkbox */
                    .switch input {
                      opacity: 0;
                      width: 0;
                      height: 0;
                    }
                    
                    /* The slider */
                    .slider {
                      position: absolute;
                      cursor: pointer;
                      top: 0;
                      left: 0;
                      right: 0;
                      bottom: 0;
                      background-color: #ccc;
                      -webkit-transition: .4s;
                      transition: .4s;
                    }
                    
                    .slider:before {
                      position: absolute;
                      content: "";
                      height: 26px;
                      width: 26px;
                      left: 4px;
                      bottom: 4px;
                      background-color: white;
                      -webkit-transition: .4s;
                      transition: .4s;
                    }
                    
                    input:checked + .slider {
                      background-color: #2196F3;
                    }
                    
                    input:focus + .slider {
                      box-shadow: 0 0 1px #2196F3;
                    }
                    
                    input:checked + .slider:before {
                      -webkit-transform: translateX(26px);
                      -ms-transform: translateX(26px);
                      transform: translateX(26px);
                    }
                    
                    /* Rounded sliders */
                    .slider.round {
                      border-radius: 34px;
                    }
                    
                    .slider.round:before {
                      border-radius: 50%;
                    }
                `}</style>
        <label htmlFor='notification' style={{ fontSize: "1.2rem" }}>Enable alert notification</label>
        <label className="switch">
          <input name='notification' type="checkbox" />
          <span className="slider round"></span>
        </label>
        <div className="buttons">
          <button type="button" className="trigger-push">Trigger Push Notification</button>
        </div>
        <script src="../../utils/clientpush.js"></script>
      </div>
    </PageContainer>
  )
}