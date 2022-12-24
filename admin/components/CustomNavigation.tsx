// admin/components/CustomNavigation.tsx
import { NavigationContainer, NavItem, ListNavItems } from '@keystone-6/core/admin-ui/components';
import type { NavigationProps } from '@keystone-6/core/admin-ui/components';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faCircleInfo, faGear } from '@fortawesome/free-solid-svg-icons';

export function CustomNavigation({ authenticatedItem, lists }: NavigationProps) {
  return (
    <NavigationContainer authenticatedItem={authenticatedItem}>
      <ListNavItems lists={lists}/>
      <NavItem href="/dashboard"><FontAwesomeIcon icon={faChartLine} /> Snort dashboard</NavItem>
      {/* <NavItem href="/detail"><FontAwesomeIcon icon={faCircleInfo} /> Alert details</NavItem> */}
      {/* <NavItem href="/setting"><FontAwesomeIcon icon={faGear} /> Snort setting</NavItem> */}
    </NavigationContainer>
  )
}