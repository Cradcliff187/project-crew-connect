import ProjectDocumentsSection from '@/components/projects/documents/ProjectDocumentsSection';

interface ProjectDocumentsListProps {
  projectId: string;
}

const ProjectDocumentsList = ({ projectId }: ProjectDocumentsListProps) => {
  return <ProjectDocumentsSection projectId={projectId} />;
};

export default ProjectDocumentsList;
