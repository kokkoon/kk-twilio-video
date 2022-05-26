import useVideoContext from '../useVideoContext/useVideoContext';
import useDominantSpeaker from '../useDominantSpeaker/useDominantSpeaker';
import useParticipants from '../useParticipants/useParticipants';
import useScreenShareParticipant from '../useScreenShareParticipant/useScreenShareParticipant';
import useSelectedParticipant from '../../components/VideoProvider/useSelectedParticipant/useSelectedParticipant';

export default function useMainParticipant() {
  const [selectedParticipant] = useSelectedParticipant();
  const screenShareParticipant = useScreenShareParticipant();
  const dominantSpeaker = useDominantSpeaker();
  const participants = useParticipants();
  const { room } = useVideoContext();
  const localParticipant = room?.localParticipant;
  const remoteScreenShareParticipant = screenShareParticipant !== localParticipant ? screenShareParticipant : null;
  const getFirstPresenter: any = (localStorage.getItem("room") && localStorage.getItem("room") != "") ? localStorage.getItem("room") : null;
  const firstPresenter = getFirstPresenter ? JSON.parse(getFirstPresenter) : null;
  var presenterUser = null;
  // The participant that is returned is displayed in the main video area. Changing the order of the following
  // variables will change the how the main speaker is determined.
  if (firstPresenter) {
    let userList = [localParticipant, ...participants]
    console.log(userList);
    presenterUser = userList.find((x: any) => x.identity == firstPresenter.presenter_user)

  }
  return presenterUser || selectedParticipant || remoteScreenShareParticipant || dominantSpeaker || participants[0] || localParticipant;

}
