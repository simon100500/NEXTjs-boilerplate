import { isAuth } from '@/lib/auth'
import { getErrorResponse } from '@/lib/helpers'
import { NextResponse } from 'next/server'
import { QueryMode, prisma } from '@/lib/prisma.db'

interface Params {
  params: {
    id: string
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    await isAuth(req, params)

    const {
      name,
      permission: permissionRequest,
      clientPermission: clientPermissionRequest,
      description,
    } = await req.json()

    let type
    let permission = []
    let clientPermission = []
    if (name) type = name?.toUpperCase().trim().replace(/\s+/g, '_')

    if (permissionRequest) {
      if (Array.isArray(permissionRequest)) {
        permission = permissionRequest
      } else {
        permission = [permissionRequest]
      }
    }

    if (clientPermissionRequest) {
      if (Array.isArray(clientPermissionRequest)) {
        clientPermission = clientPermissionRequest
      } else {
        clientPermission = [clientPermissionRequest]
      }
    }

    permission = permission?.filter((per) => per)
    clientPermission = clientPermission?.filter((client) => client)

    const object = await prisma.role.findUnique({
      where: { id: Number(params.id) },
    })
    if (!object) return getErrorResponse('Role not found', 400)

    const checkExistence = await prisma.role.findFirst({
      where: {
        name: { equals: name, mode: QueryMode.insensitive },
        type: { equals: type, mode: QueryMode.insensitive },
        id: { not: Number(params.id) },
      },
    })
    if (checkExistence) return getErrorResponse('Role already exist')

    await prisma.role.update({
      where: { id: Number(params.id) },
      data: {
        name,
        description,
        type,
        permissions: {
          connect: permission?.map((pre) => ({ id: Number(pre) })),
        },
        clientPermissions: {
          connect: clientPermission?.map((client) => ({ id: Number(client) })),
        },
      },
    })

    return NextResponse.json({
      ...object,
      message: 'Role updated successfully',
    })
  } catch ({ status = 500, message }: any) {
    return getErrorResponse(message, status)
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    await isAuth(req, params)

    const checkIfSuperAdmin = await prisma.role.findUnique({
      where: { id: Number(params.id) },
    })
    if (checkIfSuperAdmin && checkIfSuperAdmin?.type === 'SUPER_ADMIN')
      return getErrorResponse('Role is super admin', 400)

    const object = await prisma.role.delete({
      where: { id: Number(params.id) },
    })

    if (!object) return getErrorResponse('Role not found', 404)

    return NextResponse.json({
      ...object,
      message: 'Role deleted successfully',
    })
  } catch ({ status = 500, message }: any) {
    return getErrorResponse(message, status)
  }
}