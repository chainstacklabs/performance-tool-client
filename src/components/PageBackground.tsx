import InfraBackground from './InfraBackground';
import ChunkyGrainBackground from './ChunkyGrainBackground';

export default function PageBackground() {
  return (
    <>
      <InfraBackground />
      <ChunkyGrainBackground grainSize={1.25} frameDelay={90} opacity={0.345} />
    </>
  );
}
