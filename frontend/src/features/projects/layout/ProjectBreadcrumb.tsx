import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { truncate } from '@/lib/truncate';

import { PROJECT_LAYOUT_MESSAGES } from './messages';
import { useProject } from './useProject';

const PROJECT_NAME_MAX_LENGTH = 40;

export function ProjectBreadcrumb() {
  const { project } = useProject();
  const projectName = truncate(project.name, PROJECT_NAME_MAX_LENGTH);

  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
      <Link
        className="underline-offset-4 hover:text-foreground hover:underline"
        to={ROUTES.DASHBOARD}
      >
        {PROJECT_LAYOUT_MESSAGES.BREADCRUMB_PROJECTS}
      </Link>
      <span className="mx-2" aria-hidden="true">
        /
      </span>
      <span className="font-medium text-foreground" title={project.name}>
        {projectName}
      </span>
    </nav>
  );
}
