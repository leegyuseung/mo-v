"use client";

import ContentsWriteCoreSection from "@/components/screens/contents/contents-write-core-section";
import ContentsWriteScheduleHostSection from "@/components/screens/contents/contents-write-schedule-host-section";
import ContentsWriteDetailContactSection from "@/components/screens/contents/contents-write-detail-contact-section";
import type { ContentsWriteMainFieldsProps } from "@/types/contents-write-components";

export default function ContentsWriteMainFields(props: ContentsWriteMainFieldsProps) {
  return (
    <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-5">
      <ContentsWriteCoreSection
        title={props.title}
        setTitle={props.setTitle}
        titleError={props.titleError}
        setTitleError={props.setTitleError}
        applicationUrl={props.applicationUrl}
        setApplicationUrl={props.setApplicationUrl}
        applicationUrlError={props.applicationUrlError}
        setApplicationUrlError={props.setApplicationUrlError}
        getApplicationUrlErrorMessage={props.getApplicationUrlErrorMessage}
        contentTypes={props.contentTypes}
        onToggleType={props.onToggleType}
        participantComposition={props.participantComposition}
        setParticipantComposition={props.setParticipantComposition}
      />

      <ContentsWriteScheduleHostSection
        hostName={props.hostName}
        setHostName={props.setHostName}
        hostOrganization={props.hostOrganization}
        setHostOrganization={props.setHostOrganization}
        reward={props.reward}
        setReward={props.setReward}
        recruitmentStart={props.recruitmentStart}
        setRecruitmentStart={props.setRecruitmentStart}
        recruitmentEnd={props.recruitmentEnd}
        setRecruitmentEnd={props.setRecruitmentEnd}
        recruitmentScheduleError={props.recruitmentScheduleError}
        setRecruitmentScheduleError={props.setRecruitmentScheduleError}
        contentStart={props.contentStart}
        setContentStart={props.setContentStart}
        contentEnd={props.contentEnd}
        setContentEnd={props.setContentEnd}
        contentScheduleError={props.contentScheduleError}
        setContentScheduleError={props.setContentScheduleError}
        minParticipants={props.minParticipants}
        setMinParticipants={props.setMinParticipants}
        maxParticipants={props.maxParticipants}
        setMaxParticipants={props.setMaxParticipants}
        normalizeParticipantCount={props.normalizeParticipantCount}
      />

      <ContentsWriteDetailContactSection
        participationRequirement={props.participationRequirement}
        setParticipationRequirement={props.setParticipationRequirement}
        description={props.description}
        setDescription={props.setDescription}
        register={props.register}
        formErrors={props.formErrors}
        discord={props.discord}
        setDiscord={props.setDiscord}
        otherContact={props.otherContact}
        setOtherContact={props.setOtherContact}
      />
    </div>
  );
}
