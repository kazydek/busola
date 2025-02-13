import React from 'react';
import LuigiClient from '@luigi-project/client';
import PropTypes from 'prop-types';

import { Panel, LayoutGrid } from 'fundamental-react';
import { useGetList, Spinner, CircleProgress } from 'react-shared';

import {
  getHealthyStatusesCount,
  getHealthyReplicasCount,
} from './NamespaceWorkloadsHelpers';

NamespaceWorkloads.propTypes = { namespace: PropTypes.string.isRequired };

const navigateTo = path => () => {
  LuigiClient.linkManager()
    .fromContext('namespaces')
    .navigate(path);
};

const ResourceCircle = ({ data, loading, error, title, color }) => {
  if (error) {
    return `Error while loading ${title} data due to: ${error.message}`;
  } else if (loading || !data) {
    return <Spinner />;
  }
  const navigationPath = title
    .split(' ')
    .join('')
    .toLowerCase();
  return (
    <CircleProgress
      onClick={navigateTo(navigationPath)}
      color={color}
      value={
        title === 'Pods'
          ? getHealthyStatusesCount(data)
          : getHealthyReplicasCount(data)
      }
      max={data.length}
      title={title}
    />
  );
};

const PodsCircle = ({ namespace }) => {
  const { data, error, loading = true } = useGetList()(
    `/api/v1/namespaces/${namespace}/pods`,
    {
      pollingInterval: 3100,
    },
  );
  return (
    <ResourceCircle
      data={data}
      loading={loading}
      error={error}
      title="Pods"
      color="blue"
    />
  );
};

const DeploymentsCircle = ({ namespace }) => {
  const { data, error, loading = true } = useGetList()(
    `/apis/apps/v1/namespaces/${namespace}/deployments`,
    {
      pollingInterval: 3200,
    },
  );
  return (
    <ResourceCircle
      data={data}
      loading={loading}
      error={error}
      title="Deployments"
      color="green"
    />
  );
};

const ReplicaSetsCircle = ({ namespace }) => {
  const { data, error, loading = true } = useGetList()(
    `/apis/apps/v1/namespaces/${namespace}/replicasets`,
    {
      pollingInterval: 3300,
    },
  );
  return (
    <ResourceCircle
      data={data}
      loading={loading}
      error={error}
      title="Replica Sets"
      color="purple"
    />
  );
};

export function NamespaceWorkloads({ namespace }) {
  return (
    <Panel className="fd-has-margin-m">
      <Panel.Header>
        <Panel.Head title="Healthy Resources" />
      </Panel.Header>
      <Panel.Body className="namespace-workloads__body">
        <LayoutGrid cols={3}>
          <PodsCircle namespace={namespace} />
          <DeploymentsCircle namespace={namespace} />
          <ReplicaSetsCircle namespace={namespace} />
        </LayoutGrid>
      </Panel.Body>
    </Panel>
  );
}
