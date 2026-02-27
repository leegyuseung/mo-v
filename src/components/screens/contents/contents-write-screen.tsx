"use client";

import ContentsWriteImagePanel from "@/components/screens/contents/contents-write-image-panel";
import ContentsWriteMainFields from "@/components/screens/contents/contents-write-main-fields";
import { useContentsWriteForm } from "@/hooks/contents/use-contents-write-form";

/** 콘텐츠 작성 폼 화면 */
export default function ContentsWriteScreen() {
  const form = useContentsWriteForm();

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          await form.handleSubmit();
        }}
      >
        <fieldset
          disabled={form.isSubmitting || form.isUploadingImage}
          className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]"
        >
          <ContentsWriteMainFields
            title={form.title}
            setTitle={form.setTitle}
            titleError={form.titleError}
            setTitleError={form.setTitleError}
            applicationUrl={form.applicationUrl}
            setApplicationUrl={form.setApplicationUrl}
            applicationUrlError={form.applicationUrlError}
            setApplicationUrlError={form.setApplicationUrlError}
            getApplicationUrlErrorMessage={form.getApplicationUrlErrorMessage}
            contentTypes={form.contentTypes}
            onToggleType={form.onToggleType}
            participantComposition={form.participantComposition}
            setParticipantComposition={form.setParticipantComposition}
            hostName={form.hostName}
            setHostName={form.setHostName}
            hostOrganization={form.hostOrganization}
            setHostOrganization={form.setHostOrganization}
            reward={form.reward}
            setReward={form.setReward}
            recruitmentStart={form.recruitmentStart}
            setRecruitmentStart={form.setRecruitmentStart}
            recruitmentEnd={form.recruitmentEnd}
            setRecruitmentEnd={form.setRecruitmentEnd}
            recruitmentScheduleError={form.recruitmentScheduleError}
            setRecruitmentScheduleError={form.setRecruitmentScheduleError}
            contentStart={form.contentStart}
            setContentStart={form.setContentStart}
            contentEnd={form.contentEnd}
            setContentEnd={form.setContentEnd}
            contentScheduleError={form.contentScheduleError}
            setContentScheduleError={form.setContentScheduleError}
            minParticipants={form.minParticipants}
            setMinParticipants={form.setMinParticipants}
            maxParticipants={form.maxParticipants}
            setMaxParticipants={form.setMaxParticipants}
            normalizeParticipantCount={form.normalizeParticipantCount}
            participationRequirement={form.participationRequirement}
            setParticipationRequirement={form.setParticipationRequirement}
            description={form.description}
            setDescription={form.setDescription}
            register={form.register}
            formErrors={form.formErrors}
            discord={form.discord}
            setDiscord={form.setDiscord}
            otherContact={form.otherContact}
            setOtherContact={form.setOtherContact}
          />

          <ContentsWriteImagePanel
            isSubmitting={form.isSubmitting}
            isUploadingImage={form.isUploadingImage}
            posterFilePreview={form.posterFilePreview}
            onSelectPosterFile={form.onSelectPosterFile}
            onClickCancel={form.onClickCancel}
          />
        </fieldset>
      </form>
    </div>
  );
}
