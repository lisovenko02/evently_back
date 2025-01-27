import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApplicationStatus, User } from '@prisma/client';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  async createApplication(
    createApplicationDto: CreateApplicationDto,
    user: User,
  ) {
    const event = await this.prisma.event.findFirst({
      where: {
        id: createApplicationDto.eventId,
      },
    });

    if (!(event.eventStatus === 'OPEN_FOR_APPLICATIONS')) {
      throw new BadRequestException(
        'Applications for this event are not yet active.',
      );
    }

    const existingApplication = await this.prisma.application.findFirst({
      where: {
        eventId: createApplicationDto.eventId,
        senderId: user.id,
      },
    });

    if (existingApplication) {
      throw new BadRequestException('You have already applied for this event.');
    }

    const existingEventUser = await this.prisma.eventUser.findFirst({
      where: {
        eventId: createApplicationDto.eventId,
        userId: user.id,
      },
    });

    if (existingEventUser) {
      throw new BadRequestException('You are already a member of this event.');
    }

    const application = await this.prisma.application.create({
      data: {
        senderId: user.id,
        eventId: createApplicationDto.eventId,
        senderComment: createApplicationDto.senderComment || '',
        applicationStatus: 'PENDING',
      },
    });

    return application;
  }

  async updateApplicationStatus(
    applicationId: number,
    approverComment: string,
    status: ApplicationStatus,
    user: User,
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { event: true, sender: true },
    });

    if (!application) {
      throw new BadRequestException('Application not found');
    }

    if (
      application.applicationStatus === 'ACCEPTED' ||
      application.applicationStatus === 'REJECTED'
    ) {
      throw new BadRequestException(
        `Application has already been processed with status: ${application.applicationStatus}`,
      );
    }

    let eventUser = await this.prisma.eventUser.findFirst({
      where: {
        eventId: application.eventId,
        userId: application.senderId,
      },
    });

    if (!eventUser) {
      eventUser = await this.prisma.eventUser.create({
        data: {
          userId: application.senderId,
          eventId: application.eventId,
          status: 'BANNED',
          role: 'USER',
        },
      });
    }

    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        approverId: user.id,
        applicationStatus: status,
        approverComment,
      },
    });

    if (status === 'ACCEPTED') {
      await this.prisma.event.update({
        where: { id: application.eventId },
        data: {
          members: {
            connect: { id: eventUser.id },
          },
        },
      });
    }

    return updatedApplication;
  }
}
