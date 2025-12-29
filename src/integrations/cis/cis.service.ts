import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { PaginationDto } from 'src/common/dtos';
import { transformCisMeta } from 'src/utils';

@Injectable()
export class CisService {
  constructor(
    private readonly axios: HttpService,
    private readonly config: ConfigService,
  ) {}

  private accessToken = 'WuSNbsxZjbYFNa6JCDhbVjEWinTZ9lSEnyEpuST7VnA';
  private cisBasedUrl = 'http://cistest-v16.central10x.com';

  async getProjects(query: PaginationDto) {
    const { page = 1, perPage = 5 } = query;
    const { data } = await firstValueFrom(
      this.axios
        .get(`${this.cisBasedUrl}/api/v1/projects`, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
          params: {
            page,
            per_page: perPage,
          },
        })
        .pipe(
          catchError((error) => {
            throw new InternalServerErrorException(
              error.response?.data?.message,
            );
          }),
        ),
    );

    return {
      data: data.data,
      meta: data.meta ? transformCisMeta(data.meta) : undefined,
    };
  }

  async getProjectById(id: string) {
    const { data } = await firstValueFrom(
      this.axios
        .get(`${this.cisBasedUrl}/api/v1/projects/${id}`, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        })
        .pipe(
          catchError((error) => {
            if (error.status && error.status == 404)
              throw new NotFoundException('Project not found in CIS');
            throw new InternalServerErrorException(
              error.response?.data?.message,
            );
          }),
        ),
    );

    return data.data;
  }

  async getClusters(query: PaginationDto) {
    const { page = 1, perPage = 5 } = query;
    const { data } = await firstValueFrom(
      this.axios
        .get(`${this.cisBasedUrl}/api/v1/clusters`, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
          params: {
            page,
            per_page: perPage,
          },
        })
        .pipe(
          catchError((error) => {
            throw new InternalServerErrorException(
              error.response?.data?.message,
            );
          }),
        ),
    );

    return {
      data: data.data,
      meta: data.meta ? transformCisMeta(data.meta) : undefined,
    };
  }

  async getClusterById(id: string) {
    const { data } = await firstValueFrom(
      this.axios
        .get(`${this.cisBasedUrl}/api/v1/clusters/${id}`, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        })
        .pipe(
          catchError((error) => {
            if (error.status && error.status == 404)
              throw new NotFoundException('Cluster not found in CIS');
            throw new InternalServerErrorException(
              error.response?.data?.message,
            );
          }),
        ),
    );

    return data.data;
  }

  async getClustersByProjectId(id: string, query: PaginationDto) {
    const { page = 1, perPage = 5 } = query;
    const { data } = await firstValueFrom(
      this.axios
        .get(`${this.cisBasedUrl}/api/v1/projects/${id}/clusters`, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
          params: {
            page,
            per_page: perPage,
          },
        })
        .pipe(
          catchError((error) => {
            throw new InternalServerErrorException(
              error.response?.data?.message,
            );
          }),
        ),
    );

    return {
      data: data.data,
      meta: data.meta ? transformCisMeta(data.meta) : undefined,
    };
  }

  async getUnits(query: PaginationDto) {
    const { page = 1, perPage = 50 } = query;
    const { data } = await firstValueFrom(
      this.axios
        .get(`${this.cisBasedUrl}/api/v1/units`, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
          params: {
            page,
            per_page: perPage,
          },
        })
        .pipe(
          catchError((error) => {
            throw new InternalServerErrorException(
              error.response?.data?.message,
            );
          }),
        ),
    );

    return {
      data: data.data,
      meta: data.meta ? transformCisMeta(data.meta) : undefined,
    };
  }

  async getUnitById(id: string) {
    const { data } = await firstValueFrom(
      this.axios
        .get(`${this.cisBasedUrl}/api/v1/units/${id}`, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        })
        .pipe(
          catchError((error) => {
            if (error.status && error.status == 404)
              throw new NotFoundException(
                `Unit with id ${id} not found in CIS`,
              );
            throw new InternalServerErrorException(
              error.response?.data?.message,
            );
          }),
        ),
    );

    return data.data;
  }

  async getUnitsByProjectId(id: string, query: PaginationDto) {
    const { page = 1, perPage = 5 } = query;
    const { data } = await firstValueFrom(
      this.axios
        .get(`${this.cisBasedUrl}/api/v1/projects/${id}/units`, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
          params: {
            page,
            per_page: perPage,
          },
        })
        .pipe(
          catchError((error) => {
            throw new InternalServerErrorException(
              error.response?.data?.message,
            );
          }),
        ),
    );

    return {
      data: data.data,
      meta: data.meta ? transformCisMeta(data.meta) : undefined,
    };
  }

  async getUnitsByClusterId(id: string, query: PaginationDto) {
    const { page = 1, perPage = 5 } = query;
    const { data } = await firstValueFrom(
      this.axios
        .get(`${this.cisBasedUrl}/api/v1/clusters/${id}/units`, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
          params: {
            page,
            per_page: perPage,
          },
        })
        .pipe(
          catchError((error) => {
            throw new InternalServerErrorException(
              error.response?.data?.message,
            );
          }),
        ),
    );

    return {
      data: data.data,
      meta: data.meta ? transformCisMeta(data.meta) : undefined,
    };
  }
}
