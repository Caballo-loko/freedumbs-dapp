'use client';

import { useState } from 'react';
import { AppHero } from '../ui/ui-layout';
import { ClusterUiModal } from './cluster-ui';
import { ClusterUiTable } from './cluster-ui';
import { useCluster } from './cluster-data-access';

export default function ClusterFeature() {
  const { cluster, clusters, setCluster } = useCluster();
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <AppHero
        title="Clusters"
        subtitle="Manage and select your Solana clusters"
      >
        <ClusterUiModal
          show={showModal}
          hideModal={() => setShowModal(false)}
        />
        <button
          className="btn btn-xs lg:btn-md btn-primary"
          onClick={() => setShowModal(true)}
        >
          Add Cluster
        </button>
      </AppHero>
      <ClusterUiTable />
      <h1>Current Cluster: {cluster.name}</h1>
      <ul>
        {clusters.map((c) => (
          <li key={c.name}>
            <button onClick={() => setCluster(c)}>{c.name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}